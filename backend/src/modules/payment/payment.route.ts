import { Router } from 'express';
import * as paymentController from './payment.controller';
import { authMiddleware, roleGuard } from '../auth/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Guest tạo yêu cầu thanh toán
router.post('/create-intent', paymentController.createPaymentIntent);

// Admin/Waiter xác nhận tiền mặt
router.post('/confirm-cash', authMiddleware, roleGuard([Role.ADMIN, Role.WAITER]), paymentController.confirmCashPayment);

// Webhook (Đã đăng ký riêng ở app.ts nhưng để đây cho nhớ)
// router.post('/webhook', ...); 

export default router;