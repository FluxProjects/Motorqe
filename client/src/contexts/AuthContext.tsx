import { create } from "zustand";

interface AuthState {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: any) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  login: (token, user) => {
    localStorage.setItem("token", token);
    set({ token, user, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem("token");
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
