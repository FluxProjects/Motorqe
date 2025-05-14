import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@shared/schema";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User) => void;
  setToken: (token: string | null) => void;
  setIsAuthenticated: (status: boolean) => void;
  // login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setToken: (token: string | null) => {
        // Add type here too
        set({ token });
        if (token) {
          localStorage.setItem("auth_token", token);
        } else {
          localStorage.removeItem("auth_token");
        }
      },

      setIsAuthenticated: (status) => {
        set({ isAuthenticated: status });
      },

      // login: async (credentials) => {
      //   set({ isLoading: true, error: null });
      //   try {
      //     const res = await fetch("/api/auth/login", {
      //       method: "POST",
      //       credentials: "include",
      //       body: JSON.stringify(credentials),
      //       headers: { "Content-Type": "application/json" },
      //     });

      //     if (res.ok) {
      //       const { user, token } = await res.json();
      //       set({ user, token, isAuthenticated: true, isLoading: false });
      //     } else {
      //       const error = await res.json();
      //       set({ error: error.message, isLoading: false });
      //     }
      //   } catch (err) {
      //     set({ error: "Network error", isLoading: false });
      //   }
      // },

      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
          });
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        } catch (err) {
          set({ error: "Logout failed", isLoading: false });
        }
      },

      initializeAuth: async () => {
        set({ isLoading: true, error: null });
        // Skip reinitializing if already authenticated    
        try {
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
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Call initializeAuth after persisted state has been rehydrated
        state?.initializeAuth?.();
      },
    }
  )
);
