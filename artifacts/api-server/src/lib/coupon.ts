import { db } from "@workspace/db";
import { couponsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import type { Coupon } from "@workspace/db";

export type CouponEvaluation = {
  valid: boolean;
  discount: number;
  code: string | null;
  message: string | null;
  coupon: Coupon | null;
};

export async function evaluateCoupon(rawCode: string, subtotal: number): Promise<CouponEvaluation> {
  const code = rawCode.trim().toUpperCase();
  if (!code) {
    return { valid: false, discount: 0, code: null, message: "أدخل رمز الخصم", coupon: null };
  }

  const coupon = await db.query.couponsTable.findFirst({ where: eq(couponsTable.code, code) });
  if (!coupon) {
    return { valid: false, discount: 0, code: null, message: "رمز الخصم غير صحيح", coupon: null };
  }
  if (!coupon.isActive) {
    return { valid: false, discount: 0, code: null, message: "رمز الخصم غير مفعّل", coupon: null };
  }

  const now = Date.now();
  if (coupon.startsAt && coupon.startsAt.getTime() > now) {
    return { valid: false, discount: 0, code: null, message: "رمز الخصم لم يبدأ بعد", coupon: null };
  }
  if (coupon.expiresAt && coupon.expiresAt.getTime() < now) {
    return { valid: false, discount: 0, code: null, message: "انتهت صلاحية رمز الخصم", coupon: null };
  }
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, discount: 0, code: null, message: "تم استنفاد رمز الخصم", coupon: null };
  }
  if (coupon.minSubtotal != null && subtotal < Number(coupon.minSubtotal)) {
    return {
      valid: false,
      discount: 0,
      code: null,
      message: `الحد الأدنى للطلب ${Number(coupon.minSubtotal)} ش`,
      coupon: null,
    };
  }

  let discount = coupon.type === "percent"
    ? (subtotal * Number(coupon.value)) / 100
    : Number(coupon.value);
  discount = Math.min(discount, subtotal);
  discount = Math.round(discount * 100) / 100;

  return { valid: true, discount, code: coupon.code, message: null, coupon };
}
