export type ReviewSort = "newest" | "helpful";

export interface ReviewAuthor {
  id: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface Review {
  id: string;
  rating: number;
  title: string;
  body: string;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
  author: ReviewAuthor;
  isOwn: boolean;
  hasVotedHelpful: boolean;
}

export interface PaginatedReviews {
  items: Review[];
  total: number;
  page: number;
  pageSize: number;
}

export interface MyReview {
  id: string;
  rating: number;
  title: string;
  body: string;
}

export interface ReviewInput {
  rating: number;
  title: string;
  body: string;
}
