import { Request, Response } from "express";
import * as tableService from "./table.service";

// Create Table
export const createTable = async (req: Request, res: Response) => {
  try {
    const { name, capacity, restaurantId } = req.body;
    const table = await tableService.createTable(name, parseInt(capacity), restaurantId);
    res.status(201).json(table);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Get All Tables
export const getTables = async (req: Request, res: Response) => {
  try {
    const tables = await tableService.getTables();
    // Return wrapped in { data: tables } to match frontend interceptor expectations
    res.json({ data: tables });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Update Table (supports PATCH for any field)
export const updateTable = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body; // { name, capacity, isActive, waiterId }

    // Ensure capacity is int if present
    if (data.capacity) {
      data.capacity = parseInt(data.capacity);
    }

    const table = await tableService.updateTable(id, data);
    res.json(table);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Delete Table
export const deleteTable = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await tableService.deleteTable(id);
    res.json({ message: "Table deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Get QR Code
export const getTableQR = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const qrData = await tableService.generateTableQRCode(id);
    res.json({ data: qrData });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Regenerate QR Code for a single table
export const regenerateTableQR = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const qrData = await tableService.regenerateTableQRCode(id);
    res.json({ data: qrData, message: "QR code regenerated successfully" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Regenerate ALL QR Codes
export const regenerateAllQRs = async (req: Request, res: Response) => {
  try {
    const result = await tableService.regenerateAllQRCodes();
    res.json({
      message: `Successfully regenerated ${result.successful} out of ${result.total} QR codes`,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Verify QR Token
export const verifyQRToken = async (req: Request, res: Response) => {
  try {
    const { tableId, token } = req.body;
    const result = await tableService.verifyQRToken(tableId, token);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
