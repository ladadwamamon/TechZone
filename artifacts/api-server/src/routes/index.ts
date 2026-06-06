import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import categoriesRouter from "./categories";
import brandsRouter from "./brands";
import blogRouter from "./blog";
import ordersRouter from "./orders";
import storeRouter from "./store";
import settingsRouter from "./settings";
import customersRouter from "./customers";
import couponsRouter from "./coupons";
import giftCardsRouter from "./gift-cards";
import subscriptionPlansRouter from "./subscription-plans";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(categoriesRouter);
router.use(brandsRouter);
router.use(blogRouter);
router.use(ordersRouter);
router.use(storeRouter);
router.use(settingsRouter);
router.use(customersRouter);
router.use(couponsRouter);
router.use(giftCardsRouter);
router.use(subscriptionPlansRouter);
router.use(adminRouter);

export default router;
