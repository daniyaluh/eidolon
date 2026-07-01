import { create } from "zustand";
import { apiClient, ApiError } from "../lib/apiClient";
import { useCartStore } from "./cartStore";
import type {
  ChatMessage,
  CreateSessionResponse,
  SendMessageResponse,
} from "../types/chat";

let idCounter = 0;
const nextId = () => `msg-${Date.now()}-${idCounter++}`;

interface ChatState {
  isOpen: boolean;
  sessionId: string | null;
  messages: ChatMessage[];
  isSending: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  sendMessage: (content: string) => Promise<void>;
  reset: () => void;
}

const GREETING: ChatMessage = {
  id: "greeting",
  role: "assistant",
  content:
    "Hi! I'm your Eidolon assistant. Tell me what you're in the mood for and I'll recommend games — I can add them to your cart or start checkout when you're ready.",
};

async function ensureSession(get: () => ChatState, set: (partial: Partial<ChatState>) => void) {
  const existing = get().sessionId;
  if (existing) return existing;
  const session = await apiClient.post<CreateSessionResponse>("/chat/sessions");
  set({ sessionId: session.id });
  return session.id;
}

export const useChatStore = create<ChatState>((set, get) => ({
  isOpen: false,
  sessionId: null,
  messages: [GREETING],
  isSending: false,

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),

  sendMessage: async (content) => {
    const trimmed = content.trim();
    if (!trimmed || get().isSending) return;

    const userMessage: ChatMessage = { id: nextId(), role: "user", content: trimmed };
    set((state) => ({ messages: [...state.messages, userMessage], isSending: true }));

    try {
      const sessionId = await ensureSession(get, set);
      const res = await apiClient.post<SendMessageResponse>(
        `/chat/sessions/${sessionId}/messages`,
        { content: trimmed }
      );

      const assistantMessage: ChatMessage = {
        id: nextId(),
        role: "assistant",
        content: res.reply,
        actions: res.actions,
      };
      set((state) => ({ messages: [...state.messages, assistantMessage] }));

      // If the agent added items, refresh the cart so the badge/drawer reflect it.
      if (res.actions.some((a) => a.type === "added_to_cart")) {
        useCartStore.getState().fetchCart().catch(() => undefined);
      }
      // If checkout was started, hand off to Stripe.
      const checkout = res.actions.find((a) => a.type === "checkout_started");
      if (checkout?.url) {
        window.location.href = checkout.url;
      }
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
      set((state) => ({
        messages: [...state.messages, { id: nextId(), role: "assistant", content: message }],
      }));
    } finally {
      set({ isSending: false });
    }
  },

  reset: () => set({ sessionId: null, messages: [GREETING], isOpen: false, isSending: false }),
}));
