import { Router } from "express";
import passport from "passport";
import * as GuestController from "./guest.controller";
import { createOrder } from "../order/order.controller";

const router = Router();

// POST /api/guest/session -> Gửi { tableId: "..." } để bắt đầu
router.post("/session", GuestController.startSession);

// Route cho Menu Page 
router.get("/categories", GuestController.getCategories);
router.get("/menu-items", GuestController.getMenuItems);
router.get("/menu-items/:id/reviews", GuestController.getMenuItemReviews);
router.post("/menu-items/:id/reviews", (req, res, next) => {
    // Optional auth: tries to authenticate, but proceeds anyway
    passport.authenticate('jwt', { session: false }, (err: any, user: any) => {
        if (user) req.user = user;
        next();
    })(req, res, next);
}, GuestController.createMenuItemReview);

router.post("/orders", createOrder);
router.get("/orders/:tableSessionId", GuestController.getOrderDetails);
router.post("/orders/:orderId/request-bill", GuestController.requestBill);

export default router;
