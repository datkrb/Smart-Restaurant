// Enums for roles, order status, table status
export enum Role {
  Admin = "admin",
  Staff = "staff",
  Guest = "guest",
}

export enum OrderStatus {
  Pending = "pending",
  Preparing = "preparing",
  Completed = "completed",
  Cancelled = "cancelled",
}

export enum TableStatus {
  Available = "available",
  Occupied = "occupied",
  Reserved = "reserved",
}
