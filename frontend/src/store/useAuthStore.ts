import {create} from "zustand";
import {User} from "../types/auth.types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const storedUser = localStorage.getItem("user");
  const storedAccessToken = localStorage.getItem("accessToken");
  const storedRefreshToken = localStorage.getItem("refreshToken");

  return{
    user: (storedUser && storedUser !== "undefined") ? JSON.parse(storedUser) : null,
    accessToken: storedAccessToken,
    refreshToken: storedRefreshToken,
    isAuthenticated: !!storedUser,
    login: (user: User, accessToken: string, refreshToken: string) => {
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      set({ user, accessToken, refreshToken, isAuthenticated: true });
    },
    logout: () => {
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
    },
  }
})