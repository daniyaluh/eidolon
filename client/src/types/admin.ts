export interface RevenuePoint {
  date: string;
  revenue: number;
}

export interface TopSeller {
  gameId: string;
  title: string;
  coverUrl: string;
  unitsSold: number;
  revenue: number;
}

export interface Analytics {
  totalRevenue: number;
  revenueByDay: RevenuePoint[];
  topSellers: TopSeller[];
  activeSubscriptions: number;
  newUsersLast30Days: number;
}

export interface GameInput {
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  coverUrl: string;
  trailerUrl?: string | null;
  screenshots: string[];
  genres: string[];
  platforms: string[];
  releaseDate: string;
  developer: string;
  publisher: string;
  priceOneTime?: number | null;
  priceMonthly?: number | null;
  systemRequirements: Record<string, unknown>;
}
