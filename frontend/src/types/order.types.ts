export type OrderStatus = 'RECEIVED' | 'PROCESSING' | 'READY' | 'COMPLETED' | 'CANCELLED';

export interface OrderItem {
    id: string;
    quantity: number;
    price: number;
    note?: string;
    menuItem: {
        id: string;
        name: string;
        price: number;
    };
    modifiers?: any[]; // Expand if needed
}

export interface Order {
    id: string;
    tableSessionId: string;
    status: OrderStatus;
    totalAmount: number;
    createdAt: string; // ISO Date string
    updatedAt: string;
    items: OrderItem[];
    tableSession?: {
        id: string;
        table?: {
            id: string;
            name: string;
        };
    };
}
