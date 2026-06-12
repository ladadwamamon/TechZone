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
import navigationRouter from "./navigation";
import metricsRouter from "./metrics";
import adminRouter from "./admin";
import storageRouter from "./storage";
import seoRouter from "./seo";

const router: IRouter = Router();

router.use(seoRouter);
router.use(healthRouter);
router.use(storageRouter);
router.use(productsRouter);
router.use(categoriesRouter);
router.use(brandsRouter);
router.use(blogRouter);
router.use(ordersRouter);
router.use(storeRouter);
router.use(settingsRouter);
router.use(customersRouter);
router.use(couponsRouter);
router.use(navigationRouter);
router.use(metricsRouter);
router.use(adminRouter);

export default router;
