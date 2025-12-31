import { Request, Response } from "express";
import * as tableService from "./table.service";

// Create new table
export const createTable = async (req: Request, res: Response) => {
  try {
    const { name, capacity } = req.body;
    const table = await tableService.createTable(name, parseInt(capacity));
    res.status(201).json(table);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Get all tables
export const getTables = async (req: Request, res: Response) => {
  try {
    const tables = await tableService.getTables();
    res.json({ data: tables });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
// Get table QR code
export const getTableQR = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const qrData = await tableService.generateTableQRCode(id);
    res.json({ data: qrData });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
// Update table status
export const updateTableStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const table = await tableService.updateTableStatus(id, isActive);
    res.json(table);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
// Delete a table
export const deleteTable = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await tableService.deleteTable(id);
    res.json({ message: "Table deleted" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

