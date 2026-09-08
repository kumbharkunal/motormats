import 'server-only';

import { createHmac, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';

import { clientEnv } from './env.client';
import { serverEnv } from './env.server';

const API_BASE = 'https://api.razorpay.com/v1';

function authHeader(): string {
  const token = Buffer.from(
    `${clientEnv.NEXT_PUBLIC_RAZORPAY_KEY_ID}:${serverEnv.RAZORPAY_KEY_SECRET}`,
  ).toString('base64');
  return `Basic ${token}`;
}

const razorpayOrderSchema = z.object({
  id: z.string(),
  amount: z.number(),
  currency: z.string(),
  receipt: z.string().nullable().optional(),
  status: z.string(),
});

export type RazorpayOrder = z.infer<typeof razorpayOrderSchema>;

export async function createRazorpayOrder(params: {
  amountPaise: number;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrder> {
  if (!Number.isInteger(params.amountPaise) || params.amountPaise <= 0) {
    throw new Error('Razorpay amount must be a positive integer in paise');
  }

  const response = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { Authorization: authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: params.amountPaise,
      currency: 'INR',
      receipt: params.receipt,
      notes: params.notes ?? {},
      payment_capture: 1,
    }),
  });

  if (!response.ok) {
    throw new Error(`Razorpay order creation failed with status ${response.status}`);
  }

  return razorpayOrderSchema.parse(await response.json());
}

const razorpayPaymentSchema = z.object({
  id: z.string(),
  order_id: z.string().nullable(),
  status: z.string(),
  amount: z.number(),
  currency: z.string(),
  method: z.string().nullable().optional(),
  error_description: z.string().nullable().optional(),
});

export type RazorpayPayment = z.infer<typeof razorpayPaymentSchema>;

export async function fetchRazorpayPayment(paymentId: string): Promise<RazorpayPayment> {
  const response = await fetch(`${API_BASE}/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: authHeader() },
  });

  if (!response.ok) {
    throw new Error(`Razorpay payment lookup failed with status ${response.status}`);
  }

  return razorpayPaymentSchema.parse(await response.json());
}

export function verifyCheckoutSignature(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  signature: string;
}): boolean {
  const expected = createHmac('sha256', serverEnv.RAZORPAY_KEY_SECRET)
    .update(`${params.razorpayOrderId}|${params.razorpayPaymentId}`)
    .digest('hex');

  return constantTimeEquals(expected, params.signature);
}

// rawBody must not be re-serialised — JSON.parse → JSON.stringify changes whitespace and breaks the HMAC.
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const expected = createHmac('sha256', serverEnv.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  return constantTimeEquals(expected, signature);
}

function constantTimeEquals(expected: string, received: string): boolean {
  if (typeof received !== 'string' || expected.length !== received.length) return false;
  return timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(received, 'utf8'));
}
