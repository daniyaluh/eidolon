import type { UserRole } from "./user";

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: string;
  orderCount: number;
  libraryCount: number;
  reviewCount: number;
}

export interface PaginatedUsers {
  items: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
}
