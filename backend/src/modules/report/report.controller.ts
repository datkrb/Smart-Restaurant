import { Request, Response } from 'express';
import * as reportService from './report.service';

const getDateRange = (req: Request) => {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
        // Default to today if missing (though frontend should send it)
        const start = new Date();
        start.setHours(0,0,0,0);
        const end = new Date();
        end.setHours(23,59,59,999);
        return { start, end };
    }
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    // Ensure end date covers the full day if time not specified? 
    // Usually ISO string includes time. If YYYY-MM-DD, we should probably set end to 23:59:59 if logic expects it.
    // But let's assume frontend sends full ISO or we trust the input. 
    // For safety, if length is 10 (YYYY-MM-DD), adjust end.
    if ((endDate as string).length === 10) {
        end.setHours(23, 59, 59, 999);
    }
    return { start, end };
}

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const { start, end } = getDateRange(req);
    const stats = await reportService.getDashboardStats(start, end);
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getRevenueByDate = async (req: Request, res: Response) => {
  try {
    const { start, end } = getDateRange(req);
    const data = await reportService.getRevenueByDate(start, end);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getTopSellingItems = async (req: Request, res: Response) => {
  try {
    const data = await reportService.getTopSellingItems();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getUserStats = async (req: Request, res: Response) => {
    try {
        const { start, end } = getDateRange(req);
        const data = await reportService.getUserStats(start, end);
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
