import { Router } from 'express';
import * as paymentController from './payment.controller';
import { authMiddleware, roleGuard } from '../auth/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Stripe
router.post('/create-intent', paymentController.createPaymentIntent);

// Cash/Manual confirmation
router.post('/confirm-cash', authMiddleware, roleGuard([Role.ADMIN, Role.WAITER, Role.SUPER_ADMIN]), paymentController.confirmCashPayment);

// MoMo
router.post('/momo/create', paymentController.createMoMoPayment);
router.post('/momo/ipn', paymentController.momoIPN);
router.get('/momo/status/:orderId', paymentController.checkMoMoStatus);

export default router;