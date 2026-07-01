export type ChatRole = "user" | "assistant";

export interface ChatAction {
  type: "added_to_cart" | "checkout_started";
  gameId?: string;
  gameTitle?: string;
  planType?: "ONE_TIME" | "SUBSCRIPTION";
  url?: string;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  actions?: ChatAction[];
}

export interface SendMessageResponse {
  reply: string;
  actions: ChatAction[];
}

export interface CreateSessionResponse {
  id: string;
  createdAt: string;
}
