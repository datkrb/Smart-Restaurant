//1 lưu Session (bàn nào), 1 lưu Giỏ hàng.
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SessionState {
  tableId: string | null;
  sessionId: string | null;
  setSession: (tableId: string, sessionId: string) => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      tableId: null,
      sessionId: null,
      setSession: (tableId, sessionId) => set({ tableId, sessionId }),
    }),
    { name: 'restaurant-session' } // Lưu vào localStorage để reload không mất
  )
);