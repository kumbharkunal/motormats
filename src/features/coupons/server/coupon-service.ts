import 'server-only';

import { and, count, eq, sql } from 'drizzle-orm';

import { db } from '@db/client';
import { couponRedemptions, coupons } from '@db/schema/commerce';

import { AppError } from '@/lib/api/errors';
import { affectedRows } from '@/lib/db-result';
import type { Discount } from '@/features/pricing/pricing';

export type ValidatedCoupon = {
  id: number;
  code: string;
  description: string | null;
  discount: Discount;
};

export async function validateCoupon(
  rawCode: string,
  userId: number,
  cartSubtotalPaise: number,
  now = new Date(),
): Promise<ValidatedCoupon> {
  const code = rawCode.trim().toUpperCase();
  if (code.length === 0) throw new AppError('COUPON_INVALID');

  const [coupon] = await db
    .select({
      id: coupons.id,
      code: coupons.code,
      description: coupons.description,
      kind: coupons.kind,
      value: coupons.value,
      maxDiscountPaise: coupons.maxDiscountPaise,
      minOrderPaise: coupons.minOrderPaise,
      startsAt: coupons.startsAt,
      endsAt: coupons.endsAt,
      usageLimit: coupons.usageLimit,
      usageCount: coupons.usageCount,
      perUserLimit: coupons.perUserLimit,
      isActive: coupons.isActive,
    })
    .from(coupons)
    .where(eq(coupons.code, code))
    .limit(1);

  if (!coupon || !coupon.isActive) throw new AppError('COUPON_INVALID');

  if (coupon.startsAt && coupon.startsAt.getTime() > now.getTime()) {
    throw new AppError('COUPON_INVALID');
  }
  if (coupon.endsAt && coupon.endsAt.getTime() < now.getTime()) {
    throw new AppError('COUPON_EXPIRED');
  }

  if (cartSubtotalPaise < coupon.minOrderPaise) {
    throw new AppError('COUPON_NOT_APPLICABLE', {
      detail: { minOrderPaise: coupon.minOrderPaise },
    });
  }

  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
    throw new AppError('COUPON_EXPIRED');
  }

  const [used] = await db
    .select({ total: count() })
    .from(couponRedemptions)
    .where(and(eq(couponRedemptions.couponId, coupon.id), eq(couponRedemptions.userId, userId)));

  if ((used?.total ?? 0) >= coupon.perUserLimit) {
    throw new AppError('COUPON_ALREADY_USED');
  }

  return {
    id: coupon.id,
    code: coupon.code,
    description: coupon.description,
    discount:
      coupon.kind === 'percent'
        ? {
            kind: 'percent',
            basisPoints: coupon.value,
            maxDiscountPaise: coupon.maxDiscountPaise ?? undefined,
          }
        : { kind: 'fixed', amountPaise: coupon.value },
  };
}

// Conditional increment — zero affected rows means we lost the race for the last use.
export async function claimCouponUsage(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  couponId: number,
): Promise<void> {
  const result = await tx
    .update(coupons)
    .set({ usageCount: sql`${coupons.usageCount} + 1` })
    .where(
      and(
        eq(coupons.id, couponId),
        eq(coupons.isActive, true),
        sql`(${coupons.usageLimit} IS NULL OR ${coupons.usageCount} < ${coupons.usageLimit})`,
      ),
    );

  if (affectedRows(result) === 0) throw new AppError('COUPON_EXPIRED');
}
