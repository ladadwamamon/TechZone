import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { ordersTable, newsletterSubscribersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { CreateOrderBody, SubscribeNewsletterBody } from "@workspace/api-zod";
import { randomUUID } from "crypto";

const router: IRouter = Router();

router.post("/orders", async (req, res) => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const data = parsed.data;
  const subtotal = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 500 ? 0 : 30;
  const discount = data.promoCode ? subtotal * 0.1 : 0;
  const total = subtotal + shipping - discount;

  const id = `TZ-${Date.now().toString().slice(-6)}`;

  await db.insert(ordersTable).values({
    id,
    customerName: data.customerName,
    phone: data.phone,
    city: data.city,
    address: data.address,
    email: data.email ?? null,
    promoCode: data.promoCode ?? null,
    discount: discount.toString(),
    notes: data.notes ?? null,
    paymentMethod: data.paymentMethod,
    items: data.items,
    subtotal: subtotal.toString(),
    shipping: shipping.toString(),
    total: total.toString(),
    status: "pending",
  });

  res.status(201).json({
    id,
    customerName: data.customerName,
    phone: data.phone,
    city: data.city,
    address: data.address,
    email: data.email ?? null,
    promoCode: data.promoCode ?? null,
    discount,
    notes: data.notes ?? null,
    paymentMethod: data.paymentMethod,
    items: data.items,
    subtotal,
    shipping,
    total,
    status: "pending",
    createdAt: new Date().toISOString(),
  });
});

router.get("/orders/track", async (req, res) => {
  const { orderId, phone } = req.query as Record<string, string>;
  if (!orderId || !phone) return res.status(400).json({ error: "orderId and phone required" });

  const order = await db.query.ordersTable.findFirst({
    where: and(eq(ordersTable.id, orderId), eq(ordersTable.phone, phone)),
  });

  if (!order) return res.status(404).json({ error: "Order not found" });

  const statusMap: Record<string, number> = {
    pending: 1,
    confirmed: 2,
    shipped: 3,
    out_for_delivery: 4,
    delivered: 5,
  };

  const currentStep = statusMap[order.status] ?? 1;

  const timeline = [
    { statusAr: "قيد المعالجة", completed: currentStep >= 1, date: currentStep >= 1 ? order.createdAt.toISOString() : null },
    { statusAr: "تم التأكيد", completed: currentStep >= 2, date: currentStep >= 2 ? order.createdAt.toISOString() : null },
    { statusAr: "تم الشحن", completed: currentStep >= 3, date: null },
    { statusAr: "جاري التوصيل", completed: currentStep >= 4, date: null },
    { statusAr: "تم التسليم", completed: currentStep >= 5, date: null },
  ];

  const estimated = new Date(order.createdAt);
  estimated.setDate(estimated.getDate() + 3);

  res.json({
    id: order.id,
    status: order.status,
    timeline,
    estimatedDelivery: estimated.toISOString(),
    trackingNumber: null,
  });
});

router.post("/newsletter", async (req, res) => {
  const parsed = SubscribeNewsletterBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid email" });

  try {
    await db.insert(newsletterSubscribersTable).values({
      id: randomUUID(),
      email: parsed.data.email,
    }).onConflictDoNothing();
    res.json({ success: true, message: "تم الاشتراك بنجاح" });
  } catch {
    res.json({ success: false, message: "حدث خطأ، حاول مجدداً" });
  }
});

export default router;
