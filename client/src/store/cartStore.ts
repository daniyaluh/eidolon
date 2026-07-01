import { create } from "zustand";
import { toast } from "sonner";
import { apiClient } from "../lib/apiClient";
import type { CartItem, CartResponse, PlanType } from "../types/cart";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  fetchCart: () => Promise<void>;
  addItem: (gameId: string, planType: PlanType) => Promise<void>;
  setPlan: (gameId: string, planType: PlanType) => Promise<void>;
  removeItem: (gameId: string) => Promise<void>;
  reset: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  isOpen: false,
  isLoading: false,

  openDrawer: () => set({ isOpen: true }),
  closeDrawer: () => set({ isOpen: false }),

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const data = await apiClient.get<CartResponse>("/cart");
      set({ items: data.items });
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (gameId, planType) => {
    const data = await apiClient.post<CartResponse>("/cart", { gameId, planType });
    set({ items: data.items, isOpen: true });
    const added = data.items.find((item) => item.game.id === gameId);
    toast.success(added ? `Added ${added.game.title} to cart` : "Added to cart");
  },

  setPlan: async (gameId, planType) => {
    const data = await apiClient.post<CartResponse>("/cart", { gameId, planType });
    set({ items: data.items });
  },

  removeItem: async (gameId) => {
    const data = await apiClient.delete<CartResponse>(`/cart/${gameId}`);
    set({ items: data.items });
  },

  reset: () => set({ items: [], isOpen: false }),
}));
