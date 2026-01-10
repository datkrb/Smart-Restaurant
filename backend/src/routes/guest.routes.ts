import { Router } from "express";
import passport from "passport";
import { startSession, getCategories, getMenuItems, getOrderDetails, requestBill, getMenuItemReviews, createMenuItemReview } from "../controllers/guest.controller";
import { createOrder } from "../controllers/order.controller";
import { authMiddleware } from "../modules/auth/auth.middleware";

const router = Router();

// POST /api/guest/session -> Gửi { tableId: "..." } để bắt đầu
router.post("/session", startSession);

// Route cho Menu Page 
router.get("/categories", getCategories);
router.get("/menu-items", getMenuItems);
router.get("/menu-items/:id/reviews", getMenuItemReviews);
router.post("/menu-items/:id/reviews", (req, res, next) => {
    // Optional auth: tries to authenticate, but proceeds anyway
    passport.authenticate('jwt', { session: false }, (err: any, user: any) => {
        if (user) req.user = user;
        next();
    })(req, res, next);
}, createMenuItemReview);

router.post("/orders", createOrder);
router.get("/orders/:tableSessionId", getOrderDetails);
router.post("/orders/:orderId/request-bill", requestBill);

export default router;