import { Router, type IRouter } from "express";
import { ValidateCouponBody } from "@workspace/api-zod";
import { evaluateCoupon } from "../lib/coupon";

const router: IRouter = Router();

router.post("/coupons/validate", async (req, res) => {
  const parsed = ValidateCouponBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "بيانات غير صالحة" });
  const result = await evaluateCoupon(parsed.data.code, parsed.data.subtotal);
  res.json({
    valid: result.valid,
    discount: result.discount,
    code: result.code,
    message: result.message,
  });
});

export default router;
