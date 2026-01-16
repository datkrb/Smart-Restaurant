import { create } from "zustand";
import { User } from "../types/auth.types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  syncFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const storedUser = localStorage.getItem("user");
  const storedAccessToken = localStorage.getItem("accessToken");
  const storedRefreshToken = localStorage.getItem("refreshToken");

  return {
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
    syncFromStorage: () => {
      const user = localStorage.getItem("user");
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      set({
        user: (user && user !== "undefined") ? JSON.parse(user) : null,
        accessToken,
        refreshToken,
        isAuthenticated: !!user
      });
    }
  }
});

// Lắng nghe thay đổi localStorage từ các tab khác
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'user' || e.key === 'accessToken' || e.key === 'refreshToken') {
      useAuthStore.getState().syncFromStorage();
    }
  });
}