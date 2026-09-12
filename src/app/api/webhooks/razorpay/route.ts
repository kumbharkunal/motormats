import { and, eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

import { db } from '@db/client';
import { webhookEvents } from '@db/schema/commerce';

import {
  findOrderByProviderOrderId,
  markPaymentCaptured,
  markPaymentFailed,
} from '@/features/payments/server/payment-service';
import { sha256 } from '@/lib/crypto';
import { logger } from '@/lib/logger';
import { verifyWebhookSignature } from '@/lib/razorpay';

export const dynamic = 'force-dynamic';

const eventSchema = z.object({
  event: z.string(),
  payload: z.object({
    payment: z
      .object({
        entity: z.object({
          id: z.string(),
          order_id: z.string().nullable(),
          status: z.string(),
          amount: z.number(),
          error_description: z.string().nullable().optional(),
        }),
      })
      .optional(),
  }),
});

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-razorpay-signature') ?? '';

  if (!verifyWebhookSignature(rawBody, signature)) {
    logger.warn('razorpay webhook rejected: invalid signature');
    return Response.json({ ok: false }, { status: 400 });
  }

  const deliveryId = request.headers.get('x-razorpay-event-id') ?? sha256(rawBody);

  let parsed: z.infer<typeof eventSchema>;
  try {
    parsed = eventSchema.parse(JSON.parse(rawBody));
  } catch {
    logger.warn({ deliveryId }, 'razorpay webhook payload did not match the expected shape');
    return Response.json({ ok: true });
  }

  try {
    await db.insert(webhookEvents).values({
      provider: 'razorpay',
      eventId: deliveryId,
      eventType: parsed.event,
      payloadHash: sha256(rawBody),
    });
  } catch {
    logger.info({ deliveryId, event: parsed.event }, 'duplicate razorpay webhook ignored');
    return Response.json({ ok: true, duplicate: true });
  }

  try {
    await handleEvent(parsed);
    await db.update(webhookEvents).set({ processedAt: new Date() }).where(eqEvent(deliveryId));
  } catch (error) {
    logger.error(
      { err: error, deliveryId, event: parsed.event },
      'razorpay webhook handling failed',
    );
  }

  return Response.json({ ok: true });
}

function eqEvent(deliveryId: string) {
  return and(eq(webhookEvents.provider, 'razorpay'), eq(webhookEvents.eventId, deliveryId));
}

async function handleEvent(event: z.infer<typeof eventSchema>): Promise<void> {
  const payment = event.payload.payment?.entity;
  if (!payment?.order_id) return;

  const record = await findOrderByProviderOrderId(payment.order_id);
  if (!record) {
    logger.warn({ providerOrderId: payment.order_id }, 'webhook for an unknown order');
    return;
  }

  switch (event.event) {
    case 'payment.captured':
    case 'order.paid': {
      if (payment.amount !== record.amountPaise) {
        logger.error(
          {
            providerOrderId: payment.order_id,
            expected: record.amountPaise,
            received: payment.amount,
          },
          'webhook amount mismatch, refusing to mark paid',
        );
        return;
      }

      await markPaymentCaptured({
        providerOrderId: payment.order_id,
        providerPaymentId: payment.id,
        orderId: record.orderId,
        signatureVerified: true,
      });
      return;
    }

    case 'payment.failed': {
      await markPaymentFailed({
        providerOrderId: payment.order_id,
        providerPaymentId: payment.id,
        reason: payment.error_description ?? 'Payment failed',
      });
      return;
    }

    default:
      logger.debug({ event: event.event }, 'unhandled razorpay event');
  }
}
