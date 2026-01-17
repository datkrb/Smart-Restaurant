import { Router, Request, Response, NextFunction } from "express";
import * as guestController from "./guest.controller";
import passport from "passport";

const router = Router();

// Optional auth middleware - doesn't require auth but extracts user if token is present
const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("jwt", { session: false }, (err: any, user: any) => {
        if (user) {
            req.user = user;
        }
        next();
    })(req, res, next);
};

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
// Create review - uses optional auth to link userId if logged in
router.post("/menu-items/:menuItemId/reviews", optionalAuth, guestController.createReview);

export default router;
