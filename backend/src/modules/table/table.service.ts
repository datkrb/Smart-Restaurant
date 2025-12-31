import { PrismaClient } from "@prisma/client";
import * as QRCode from "qrcode";

const prisma = new PrismaClient();

//URL Frontend
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

//Get id of restaurant
const getDefaultRestaurantId = async () => {
  const restaurant = await prisma.restaurant.findFirst();
  if (!restaurant) {
    throw new Error("No restaurant found! Please run seed data first.");
  }
  return restaurant.id;
};

// Create new table
export const createTable = async (name: string, capacity: number) => {
  const restaurantId = await getDefaultRestaurantId();
  return await prisma.table.create({
    data: {
      name,
      capacity,
      restaurantId,
      isActive: true,
    },
  });
};

// Get all tables for a restaurant
export const getTables = async () => {
  const restaurantId = await getDefaultRestaurantId();
  return await prisma.table.findMany({
    where: {
      restaurantId,
    },
  });
};

// Generate QR code for a table
export const generateTableQRCode = async (tableId: string) => {
  const table = await prisma.table.findUnique({
    where: { id: tableId },
  });
  if (!table) {
    throw new Error("Table not found");
  }
  if (!table.isActive) {
    throw new Error("Table is not active");
  }

  const qrCodeData = `${FRONTEND_URL}/table/${table.id}`;
  const qrCodeImageUrl = await QRCode.toDataURL(qrCodeData);

  return qrCodeImageUrl;
};

// update table status
export const updateTableStatus = async (tableId: string, isActive: boolean) => {
  return await prisma.table.update({
    where: { id: tableId },
    data: { isActive },
  });
};

// Delete a table
export const deleteTable = async (tableId: string) => {
  return await prisma.table.delete({
    where: { id: tableId },
  });
};
