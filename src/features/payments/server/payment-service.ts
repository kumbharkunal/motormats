import 'server-only';

import { and, eq } from 'drizzle-orm';

import { db } from '@db/client';
import { orders, payments } from '@db/schema/commerce';

import { transitionOrderStatus } from '@/features/orders/server/order-service';
import { AppError } from '@/lib/api/errors';
import { recordAudit } from '@/lib/audit';
import { newPublicId } from '@/lib/ids';
import { logger } from '@/lib/logger';
import { createRazorpayOrder, fetchRazorpayPayment, verifyCheckoutSignature } from '@/lib/razorpay';

export async function startPayment(order: {
  id: number;
  publicId: string;
  orderNumber: string;
  grandTotalPaise: number;
}): Promise<{ providerOrderId: string; amountPaise: number }> {
  const providerOrder = await createRazorpayOrder({
    amountPaise: order.grandTotalPaise,
    receipt: order.orderNumber,
    notes: { orderPublicId: order.publicId },
  });

  await db.insert(payments).values({
    publicId: newPublicId(),
    orderId: order.id,
    provider: 'razorpay',
    providerOrderId: providerOrder.id,
    status: 'created',
    amountPaise: order.grandTotalPaise,
  });

  return { providerOrderId: providerOrder.id, amountPaise: order.grandTotalPaise };
}

export async function confirmPayment(params: {
  userId: number;
  orderPublicId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  signature: string;
}): Promise<{ orderNumber: string; alreadyPaid: boolean }> {
  const [order] = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      grandTotalPaise: orders.grandTotalPaise,
      userId: orders.userId,
    })
    .from(orders)
    .where(and(eq(orders.publicId, params.orderPublicId), eq(orders.userId, params.userId)))
    .limit(1);

  if (!order) throw new AppError('NOT_FOUND');
  if (order.status !== 'pending_payment') {
    return { orderNumber: order.orderNumber, alreadyPaid: true };
  }

  if (
    !verifyCheckoutSignature({
      razorpayOrderId: params.razorpayOrderId,
      razorpayPaymentId: params.razorpayPaymentId,
      signature: params.signature,
    })
  ) {
    logger.warn({ orderNumber: order.orderNumber }, 'checkout signature verification failed');
    await recordAudit({
      actorUserId: params.userId,
      action: 'payment.signature_invalid',
      resourceType: 'order',
      resourceId: order.orderNumber,
    });
    throw new AppError('PAYMENT_VERIFICATION_FAILED');
  }

  const providerPayment = await fetchRazorpayPayment(params.razorpayPaymentId);

  if (providerPayment.order_id !== params.razorpayOrderId) {
    throw new AppError('PAYMENT_VERIFICATION_FAILED');
  }
  if (providerPayment.status !== 'captured' && providerPayment.status !== 'authorized') {
    throw new AppError('PAYMENT_FAILED');
  }
  if (providerPayment.amount !== order.grandTotalPaise) {
    logger.error(
      {
        orderNumber: order.orderNumber,
        expected: order.grandTotalPaise,
        received: providerPayment.amount,
      },
      'payment amount mismatch',
    );
    throw new AppError('PAYMENT_VERIFICATION_FAILED');
  }

  await markPaymentCaptured({
    providerOrderId: params.razorpayOrderId,
    providerPaymentId: params.razorpayPaymentId,
    orderId: order.id,
    signatureVerified: true,
  });

  return { orderNumber: order.orderNumber, alreadyPaid: false };
}

export async function markPaymentCaptured(params: {
  providerOrderId: string;
  providerPaymentId: string;
  orderId: number;
  signatureVerified: boolean;
}): Promise<void> {
  await db
    .update(payments)
    .set({
      providerPaymentId: params.providerPaymentId,
      status: 'captured',
      signatureVerified: params.signatureVerified,
      capturedAt: new Date(),
    })
    .where(
      and(eq(payments.provider, 'razorpay'), eq(payments.providerOrderId, params.providerOrderId)),
    );

  const moved = await transitionOrderStatus(params.orderId, ['pending_payment'], 'paid');

  if (moved) {
    logger.info({ orderId: params.orderId }, 'order marked paid');
    await recordAudit({
      actorUserId: null,
      action: 'payment.captured',
      resourceType: 'order',
      resourceId: String(params.orderId),
      metadata: { providerPaymentId: params.providerPaymentId },
    });
  }
}

export async function markPaymentFailed(params: {
  providerOrderId: string;
  providerPaymentId: string | null;
  reason: string;
}): Promise<void> {
  await db
    .update(payments)
    .set({
      status: 'failed',
      providerPaymentId: params.providerPaymentId,
      failureReason: params.reason.slice(0, 200),
    })
    .where(
      and(
        eq(payments.provider, 'razorpay'),
        eq(payments.providerOrderId, params.providerOrderId),
        eq(payments.status, 'created'),
      ),
    );
}

export async function findOrderByProviderOrderId(providerOrderId: string) {
  const [row] = await db
    .select({
      orderId: payments.orderId,
      amountPaise: payments.amountPaise,
      paymentStatus: payments.status,
    })
    .from(payments)
    .where(and(eq(payments.provider, 'razorpay'), eq(payments.providerOrderId, providerOrderId)))
    .limit(1);

  return row ?? null;
}
