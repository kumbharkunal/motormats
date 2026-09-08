'use server';

import { z } from 'zod';

import { resolveCart } from '@/features/cart/server/resolve-cart';
import { validateCoupon } from '@/features/coupons/server/coupon-service';
import { createOrder } from '@/features/orders/server/order-service';
import { confirmPayment, startPayment } from '@/features/payments/server/payment-service';
import { computeCartTotals } from '@/features/pricing/pricing';
import { createAction } from '@/lib/api/action';
import { withIdempotency } from '@/lib/idempotency';
import { RATE_LIMITS } from '@/lib/rate-limit';

const cartLineSchema = z.object({
  variantPublicId: z.string().min(1).max(64),
  quantity: z.number().int().min(1).max(10),
});

export const previewCheckoutAction = createAction({
  input: z.object({
    lines: z.array(cartLineSchema).min(1).max(50),
    couponCode: z.string().trim().max(32).optional(),
  }),
  auth: true,
  rateLimit: RATE_LIMITS.couponApply,
  handler: async ({ input, user }) => {
    const cart = await resolveCart(input.lines);

    const coupon = input.couponCode
      ? await validateCoupon(input.couponCode, user.id, cart.totals.subtotalPaise)
      : null;

    const totals = computeCartTotals(
      cart.lines.map((line) => ({
        variantPublicId: line.variantPublicId,
        quantity: line.quantity,
        unitPricePaise: line.unitPricePaise,
        taxRateBps: line.taxRateBps,
      })),
      coupon?.discount ?? { kind: 'none' },
    );

    return {
      subtotalPaise: totals.subtotalPaise,
      discountPaise: totals.discountPaise,
      shippingPaise: totals.shippingPaise,
      taxPaise: totals.taxPaise,
      grandTotalPaise: totals.grandTotalPaise,
      couponCode: coupon?.code ?? null,
      couponDescription: coupon?.description ?? null,
    };
  },
});

export const placeOrderAction = createAction({
  input: z.object({
    lines: z.array(cartLineSchema).min(1).max(50),
    shippingAddressPublicId: z.string().min(1).max(64),
    couponCode: z.string().trim().max(32).optional(),
    customerNote: z.string().trim().max(500).optional(),
    /** Generated client-side per checkout attempt. */
    /** Client-generated per checkout attempt. */
    idempotencyKey: z.string().min(8).max(64),
  }),
  auth: true,
  rateLimit: RATE_LIMITS.orderCreate,
  handler: async ({ input, user }) =>
    withIdempotency(
      {
        scope: 'order:create',
        key: input.idempotencyKey,
        userId: user.id,
        request: {
          lines: input.lines,
          shippingAddressPublicId: input.shippingAddressPublicId,
          couponCode: input.couponCode ?? null,
        },
      },
      async () => {
        const order = await createOrder({
          userId: user.id,
          lines: input.lines,
          shippingAddressPublicId: input.shippingAddressPublicId,
          couponCode: input.couponCode,
          customerNote: input.customerNote,
        });

        const payment = await startPayment({ ...order, id: order.orderId });

        return {
          orderPublicId: order.publicId,
          orderNumber: order.orderNumber,
          amountPaise: payment.amountPaise,
          razorpayOrderId: payment.providerOrderId,
        };
      },
    ),
});

export const confirmPaymentAction = createAction({
  input: z.object({
    orderPublicId: z.string().min(1).max(64),
    razorpayOrderId: z.string().min(1).max(64),
    razorpayPaymentId: z.string().min(1).max(64),
    signature: z.string().min(1).max(256),
  }),
  auth: true,
  rateLimit: RATE_LIMITS.checkout,
  handler: async ({ input, user }) =>
    confirmPayment({
      userId: user.id,
      orderPublicId: input.orderPublicId,
      razorpayOrderId: input.razorpayOrderId,
      razorpayPaymentId: input.razorpayPaymentId,
      signature: input.signature,
    }),
});
