import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import categoriesRouter from "./categories";
import brandsRouter from "./brands";
import blogRouter from "./blog";
import ordersRouter from "./orders";
import storeRouter from "./store";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(categoriesRouter);
router.use(brandsRouter);
router.use(blogRouter);
router.use(ordersRouter);
router.use(storeRouter);

export default router;
