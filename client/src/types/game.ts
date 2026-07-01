export type GameSource = "RAWG" | "ADMIN";

export interface SystemRequirements {
  minimum?: string | null;
  recommended?: string | null;
}

export interface Game {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  coverUrl: string;
  trailerUrl: string | null;
  screenshots: string[];
  genres: string[];
  platforms: string[];
  releaseDate: string;
  developer: string;
  publisher: string;
  priceOneTime: number | null;
  priceMonthly: number | null;
  systemRequirements: SystemRequirements;
  source: GameSource;
  externalId: string | null;
  avgRating: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewRatingBreakdown {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export interface GameDetail extends Game {
  reviewSummary: {
    avgRating: number;
    ratingCount: number;
    breakdown: ReviewRatingBreakdown;
  };
}

export type GamesSort = "newest" | "price_asc" | "price_desc" | "rating" | "alphabetical";

export interface GamesFilters {
  search?: string;
  genre?: string;
  platform?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: GamesSort;
  page: number;
  pageSize: number;
}

export interface PaginatedGames {
  items: Game[];
  total: number;
  page: number;
  pageSize: number;
}
