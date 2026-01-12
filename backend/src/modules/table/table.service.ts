import { PrismaClient, Table } from "@prisma/client";
import QRCode from "qrcode";

const prisma = new PrismaClient();

// 1. Create Table
export const createTable = async (name: string, capacity: number, restaurantId?: string) => {
    // If restaurantId is not provided, try to find the first one
    let rId = restaurantId;
    if (!rId) {
        const firstRestaurant = await prisma.restaurant.findFirst();
        if (firstRestaurant) {
            rId = firstRestaurant.id;
        } else {
            // Create a default restaurant if none exists (for dev safety)
            const newRes = await prisma.restaurant.create({
                data: { name: "Default Restaurant", address: "Localhost" }
            });
            rId = newRes.id;
        }
    }

    return await prisma.table.create({
        data: {
            name,
            capacity,
            restaurantId: rId!,
            isActive: true
        }
    });
};

// 2. Get Tables
export const getTables = async () => {
    return await prisma.table.findMany({
        orderBy: { name: 'asc' },
        include: { waiter: true }
    });
};

// 3. Get Table By ID
export const getTableById = async (id: string) => {
    return await prisma.table.findUnique({
        where: { id },
        include: { waiter: true }
    });
};

// 4. Update Table (Status, Name, Capacity, Waiter)
export const updateTable = async (id: string, data: Partial<Table>) => {
    return await prisma.table.update({
        where: { id },
        data
    });
};

// 5. Delete Table
export const deleteTable = async (id: string) => {
    return await prisma.table.delete({
        where: { id }
    });
};

// 6. Generate QR Code
export const generateTableQRCode = async (id: string) => {
    const table = await prisma.table.findUnique({ where: { id } });
    if (!table) throw new Error("Table not found");

    // URL to frontend table ordering page
    const url = `${process.env.FRONTEND_URL || "http://localhost:3000"}/table/${id}`;
    
    // Generate QR as Data URL (Base64)
    const qrCode = await QRCode.toDataURL(url);
    return qrCode;
};
