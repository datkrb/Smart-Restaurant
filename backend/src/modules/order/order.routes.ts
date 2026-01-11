import { Router } from "express";
import * as OrderController from "./order.controller";

const router = Router();

// --- ORDER ROUTES ---
router.post("/", OrderController.createOrder);

export default router;
