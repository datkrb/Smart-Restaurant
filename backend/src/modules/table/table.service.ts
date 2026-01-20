import { PrismaClient, Table } from "@prisma/client";
import QRCode from "qrcode";
import crypto from "crypto";
import jwt from "jsonwebtoken";

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

    // Generate initial QR secret
    const qrSecret = crypto.randomBytes(32).toString('hex');

    return await prisma.table.create({
        data: {
            name,
            capacity,
            restaurantId: rId!,
            isActive: true,
            qrSecret,
            qrVersion: 1
        }
    });
};

// Helper to generate QR URL
const generateTableQRUrl = (table: any) => {
    // Optimized payload for shorter token
    // Only verify version (v). TableId is in URL and verified by the secret used to sign.
    const token = jwt.sign(
        { v: table.qrVersion },
        table.qrSecret || process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '365d' }
    );

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    return `${frontendUrl}/?tableId=${table.id}&token=${token}`;
};

// 9. Verify QR Token
export const verifyQRToken = async (tableId: string, token: string) => {
    const table = await prisma.table.findUnique({ where: { id: tableId } });
    if (!table) throw new Error("Table not found");

    try {
        // Verify signature using table's secret
        const decoded = jwt.verify(
            token,
            table.qrSecret || process.env.JWT_SECRET || 'fallback-secret'
        ) as any;

        // Check version matches
        // Support both old 'version' and new 'v' keys for backward compatibility during transition
        const tokenVersion = decoded.v || decoded.version;
        if (tokenVersion !== table.qrVersion) {
            throw new Error("QR Code expired (Version mismatch)");
        }

        return true;
    } catch (err) {
        throw new Error("Invalid or expired QR code");
    }
};

// 2. Get Tables
export const getTables = async () => {
    const tables = await prisma.table.findMany({
        orderBy: { name: 'asc' },
        include: { waiter: true }
    });

    // Append QR Code URL to each table
    return tables.map(table => ({
        ...table,
        qrCodeUrl: generateTableQRUrl(table)
    }));
};

// 3. Get Table By ID
export const getTableById = async (id: string) => {
    const table = await prisma.table.findUnique({
        where: { id },
        include: { waiter: true }
    });
    if (!table) return null;
    return {
        ...table,
        qrCodeUrl: generateTableQRUrl(table)
    };
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
    return await prisma.table.delete({ where: { id } });
};

// 6. Generate QR Code with Signed Token
export const generateTableQRCode = async (id: string) => {
    const table = await prisma.table.findUnique({ where: { id } });
    if (!table) throw new Error("Table not found");

    const url = generateTableQRUrl(table);

    // Generate QR as Data URL (Base64)
    const qrCode = await QRCode.toDataURL(url, {
        errorCorrectionLevel: 'H',
        width: 400,
        margin: 2
    });
    return qrCode;
};

// 7. Regenerate QR Code (invalidate old ones)
export const regenerateTableQRCode = async (id: string) => {
    const table = await prisma.table.findUnique({ where: { id } });
    if (!table) throw new Error("Table not found");

    // Generate new secret and increment version
    const newSecret = crypto.randomBytes(32).toString('hex');
    const newVersion = (table.qrVersion || 1) + 1;

    // Update table with new secret and version
    const updatedTable = await prisma.table.update({
        where: { id },
        data: {
            qrSecret: newSecret,
            qrVersion: newVersion
        }
    });

    // Generate new QR code with updated credentials
    const qrCode = await generateTableQRCode(id);

    return qrCode;
};

// 8. Regenerate ALL QR Codes
export const regenerateAllQRCodes = async () => {
    const tables = await prisma.table.findMany();

    const results = await Promise.all(
        tables.map(async (table) => {
            try {
                const newSecret = crypto.randomBytes(32).toString('hex');
                const newVersion = (table.qrVersion || 1) + 1;

                await prisma.table.update({
                    where: { id: table.id },
                    data: {
                        qrSecret: newSecret,
                        qrVersion: newVersion
                    }
                });

                return { id: table.id, name: table.name, success: true };
            } catch (error) {
                return { id: table.id, name: table.name, success: false, error };
            }
        })
    );

    return {
        total: tables.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
    };
};

// 9. Get ALL QR Images as Base64
export const getAllTableQRImages = async () => {
    console.log('DEBUG: Starting getAllTableQRImages');
    const tables = await prisma.table.findMany({
        orderBy: { name: 'asc' }
    });
    console.log(`DEBUG: Found ${tables.length} tables`);

    const results = await Promise.all(
        tables.map(async (table) => {
            try {
                const url = generateTableQRUrl(table);
                const qrDataUrl = await QRCode.toDataURL(url, {
                    errorCorrectionLevel: 'H',
                    width: 400,
                    margin: 2
                });
                return {
                    id: table.id,
                    name: table.name,
                    capacity: table.capacity,
                    qrDataUrl
                };
            } catch (error) {
                console.error(`Failed to generate QR for table ${table.id}`, error);
                return null;
            }
        })
    );



    const finalResults = results.filter(item => item !== null);
    console.log(`DEBUG: Generated ${finalResults.length} QR images`);
    return finalResults;
};

