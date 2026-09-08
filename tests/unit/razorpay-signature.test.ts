import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import { verifyCheckoutSignature, verifyWebhookSignature } from '@/lib/razorpay';

/**
 * Signature verification is what stands between "the browser said it paid" and
 * money actually having moved, so it is tested against forged, truncated and
 * cross-secret inputs rather than only the happy path.
 *
 * The secrets come from tests/setup.ts loading .env.development.
 */

const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET!;
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET!;

const ORDER_ID = 'order_ABC123';
const PAYMENT_ID = 'pay_XYZ789';

function validCheckoutSignature(orderId = ORDER_ID, paymentId = PAYMENT_ID): string {
  return createHmac('sha256', KEY_SECRET).update(`${orderId}|${paymentId}`).digest('hex');
}

describe('verifyCheckoutSignature', () => {
  it('accepts a correctly computed signature', () => {
    expect(
      verifyCheckoutSignature({
        razorpayOrderId: ORDER_ID,
        razorpayPaymentId: PAYMENT_ID,
        signature: validCheckoutSignature(),
      }),
    ).toBe(true);
  });

  it('rejects a signature computed for a different payment', () => {
    // The attack: pay for a cheap order, then present that payment against an
    // expensive one.
    expect(
      verifyCheckoutSignature({
        razorpayOrderId: ORDER_ID,
        razorpayPaymentId: 'pay_DIFFERENT',
        signature: validCheckoutSignature(),
      }),
    ).toBe(false);
  });

  it('rejects a signature computed for a different order', () => {
    expect(
      verifyCheckoutSignature({
        razorpayOrderId: 'order_DIFFERENT',
        razorpayPaymentId: PAYMENT_ID,
        signature: validCheckoutSignature(),
      }),
    ).toBe(false);
  });

  it('rejects an empty, truncated or over-long signature', () => {
    const valid = validCheckoutSignature();
    for (const signature of ['', valid.slice(0, -1), `${valid}0`, 'not-hex']) {
      expect(
        verifyCheckoutSignature({
          razorpayOrderId: ORDER_ID,
          razorpayPaymentId: PAYMENT_ID,
          signature,
        }),
      ).toBe(false);
    }
  });

  it('rejects a signature made with the webhook secret', () => {
    // The two secrets are distinct; using the wrong one must not verify.
    const wrongSecret = createHmac('sha256', WEBHOOK_SECRET)
      .update(`${ORDER_ID}|${PAYMENT_ID}`)
      .digest('hex');

    expect(
      verifyCheckoutSignature({
        razorpayOrderId: ORDER_ID,
        razorpayPaymentId: PAYMENT_ID,
        signature: wrongSecret,
      }),
    ).toBe(false);
  });
});

describe('verifyWebhookSignature', () => {
  const body = JSON.stringify({ event: 'payment.captured', payload: { amount: 449900 } });

  it('accepts the signature of the exact raw body', () => {
    const signature = createHmac('sha256', WEBHOOK_SECRET).update(body).digest('hex');
    expect(verifyWebhookSignature(body, signature)).toBe(true);
  });

  it('rejects a body that was altered after signing', () => {
    const signature = createHmac('sha256', WEBHOOK_SECRET).update(body).digest('hex');
    const tampered = body.replace('449900', '1');
    expect(verifyWebhookSignature(tampered, signature)).toBe(false);
  });

  it('rejects a re-serialised body, which is why the raw text must be used', () => {
    const signature = createHmac('sha256', WEBHOOK_SECRET).update(body).digest('hex');
    // Parsing and re-stringifying changes byte-for-byte content.
    const reserialised = JSON.stringify(JSON.parse(body), null, 2);
    expect(verifyWebhookSignature(reserialised, signature)).toBe(false);
  });

  it('rejects a signature made with the API secret rather than the webhook secret', () => {
    const wrongSecret = createHmac('sha256', KEY_SECRET).update(body).digest('hex');
    expect(verifyWebhookSignature(body, wrongSecret)).toBe(false);
  });

  it('rejects an absent signature', () => {
    expect(verifyWebhookSignature(body, '')).toBe(false);
  });
});
