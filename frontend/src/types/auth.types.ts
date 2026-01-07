export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  WAITER = "WAITER",
  KITCHEN = "KITCHEN",
  CUSTOMER = "CUSTOMER",
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string;
}

export interface LoginResponse {
  massage: string;
  accessToken: string;
  refreshToken: string;
  user: User;
}
