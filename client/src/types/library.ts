import type { Game } from "./game";

export type AcquiredVia = "ONE_TIME" | "SUBSCRIPTION";

export interface LibraryEntry {
  id: string;
  acquiredVia: AcquiredVia;
  subscriptionActive: boolean;
  pastDue: boolean;
  stripeSubscriptionId: string | null;
  playtimeMinutes: number;
  lastPlayedAt: string | null;
  game: Game;
}

export interface LibraryResponse {
  items: LibraryEntry[];
}
