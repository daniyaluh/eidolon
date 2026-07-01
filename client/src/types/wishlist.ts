import type { Game } from "./game";

export interface WishlistItem {
  id: string;
  game: Game;
}

export interface WishlistResponse {
  items: WishlistItem[];
}
