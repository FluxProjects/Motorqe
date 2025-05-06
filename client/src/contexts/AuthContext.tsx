import { create } from "zustand";

interface AuthState {
  user: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: any) => void;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },

  logout: async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      set({ user: null, isAuthenticated: false });
    }
  },
  initializeAuth: async () => {
    try {
      set({ isLoading: true });
      const res = await fetch("/api/auth/me", {
        credentials: "include",
      });
      
      if (res.ok) {
        const user = await res.json();
        set({ user, isAuthenticated: !!user, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (err) {
      console.error("Auth initialization failed", err);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
