import axiosClient from "./axiosClient";
import { Table } from "../types";

export const tableApi = {
    // 1. Get List of Tables
    // Response: { data: Table[] } - Backend routes returns { data: tables }
    getTables: () => {
        return axiosClient.get<{ data: Table[] }>("/tables")
    },

    // 2. Create Table
    // Response: Table object
    createTable: (name: string, capacity: number) => {
        return axiosClient.post<Table>("/tables", { name, capacity })
    },

    // 3. Update Table (Status, Name, Capacity)
    // Response: Updated Table
    updateTable: (id: string, data: Partial<Table>) => {
        return axiosClient.patch<Table>(`/tables/${id}`, data)
    },

    // 4. Get Table QR Code
    // Response: { data: string (base64/url) }
    getTableQR: (id: string) => {
        return axiosClient.get<{ data: string }>(`/tables/${id}/qr`)
    },

    // 5. Regenerate QR Code for single table
    // Response: { data: string, message: string }
    regenerateTableQR: (id: string) => {
        return axiosClient.post<{ data: string; message: string }>(`/tables/${id}/regenerate-qr`)
    },

    // 6. Regenerate ALL QR Codes
    // Response: { message: string, data: { total, successful, failed, results } }
    regenerateAllQRs: () => {
        return axiosClient.post<{ message: string; data: any }>("/tables/regenerate-all-qr")
    },

    // 7. Delete Table
    // Response: { message: string }
    deleteTable: (id: string) => {
        return axiosClient.delete<{ message: string }>(`/tables/${id}`)
    }
};
