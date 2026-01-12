

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isVerified: boolean;
  avatarUrl: string;
}

export interface LoginResponse {
  user: User;
 accessToken: string;
 refreshToken: string;
}


