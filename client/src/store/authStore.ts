import { create } from "zustand";
import { apiClient } from "../lib/apiClient";
import type { User } from "../types/user";

interface AuthResponse {
  user: User;
  accessToken: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  setSession: (user: User, accessToken: string) => void;
  clearSession: () => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitializing: true,

  setSession: (user, accessToken) => set({ user, accessToken, isAuthenticated: true }),

  clearSession: () => set({ user: null, accessToken: null, isAuthenticated: false }),

  updateUser: (user) => set({ user }),

  login: async (email, password) => {
    const data = await apiClient.post<AuthResponse>("/auth/login", { email, password });
    set({ user: data.user, accessToken: data.accessToken, isAuthenticated: true });
  },

  register: async (email, password, displayName) => {
    const data = await apiClient.post<AuthResponse>("/auth/register", {
      email,
      password,
      displayName,
    });
    set({ user: data.user, accessToken: data.accessToken, isAuthenticated: true });
  },

  logout: async () => {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      set({ user: null, accessToken: null, isAuthenticated: false });
    }
  },

  refreshSession: async () => {
    try {
      const data = await apiClient.post<AuthResponse>("/auth/refresh");
      set({ user: data.user, accessToken: data.accessToken, isAuthenticated: true, isInitializing: false });
    } catch {
      set({ user: null, accessToken: null, isAuthenticated: false, isInitializing: false });
    }
  },
}));
