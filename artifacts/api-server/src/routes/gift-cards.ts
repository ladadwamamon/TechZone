import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { giftCardsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { RedeemGiftCardBody } from "@workspace/api-zod";
import { requireCustomer } from "../middlewares/customer-auth";

const router: IRouter = Router();

router.post("/gift-cards/redeem", requireCustomer, async (req, res) => {
  const parsed = RedeemGiftCardBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "بيانات غير صالحة" });
  const code = parsed.data.code.trim().toUpperCase();
  const customerId = req.customer!.id;

  const card = await db.query.giftCardsTable.findFirst({ where: eq(giftCardsTable.code, code) });
  if (!card) return res.status(404).json({ error: "رمز البطاقة غير موجود" });

  if (card.status !== "active") {
    return res.status(400).json({ error: "البطاقة غير فعّالة" });
  }
  if (card.expiresAt && card.expiresAt < new Date()) {
    return res.status(400).json({ error: "انتهت صلاحية البطاقة" });
  }

  const [updated] = await db.update(giftCardsTable)
    .set({
      status: "redeemed",
      customerId,
      redeemedAt: new Date(),
      balance: "0",
    })
    .where(eq(giftCardsTable.id, card.id))
    .returning();

  res.json({
    success: true,
    balance: Number(updated.balance),
    amount: Number(card.amount),
    message: "تم تفعيل بطاقة الهدايا بنجاح",
  });
});

export default router;
