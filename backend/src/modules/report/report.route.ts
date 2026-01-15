import { Router } from 'express';
import * as reportController from './report.controller';
// Middleware authentication imports if needed, e.g., requireAdmin
// import { requireAdmin } from '../../middleware/auth'; 

const router = Router();

// Dashboard Stats
router.get('/dashboard', reportController.getDashboardStats);

// Revenue Chart
router.get('/revenue', reportController.getRevenueByDate);

// Top Selling
router.get('/top-selling', reportController.getTopSellingItems);

// User Stats
router.get('/user-stats', reportController.getUserStats);

export default router;
