import { Router } from "express";
import * as guestController from "./guest.controller";

const router = Router();

// ==================== PUBLIC GUEST ROUTES ====================
// No authentication required for these routes

// Start table session (Guest scans QR code)
router.post("/session", guestController.startSession);

// Get all categories
router.get("/categories", guestController.getCategories);

// Get menu items with filters
router.get("/menu-items", guestController.getMenuItems);

// Get order by session ID
router.get("/orders/:sessionId", guestController.getOrderBySession);

// Request bill
router.post("/orders/:orderId/request-bill", guestController.requestBill);

// Reviews
router.get("/menu-items/:menuItemId/reviews", guestController.getReviews);
router.post("/menu-items/:menuItemId/reviews", guestController.createReview);

export default router;
