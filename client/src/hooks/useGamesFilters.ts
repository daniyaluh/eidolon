import { useSearchParams } from "react-router-dom";
import { useMemo } from "react";
import type { GamesFilters, GamesSort } from "../types/game";

const DEFAULT_PAGE_SIZE = 20;
const VALID_SORTS: GamesSort[] = ["newest", "price_asc", "price_desc", "rating", "alphabetical"];

export function useGamesFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<GamesFilters>(() => {
    const sortParam = searchParams.get("sort");
    const minPriceParam = searchParams.get("minPrice");
    const maxPriceParam = searchParams.get("maxPrice");
    const pageParam = searchParams.get("page");

    return {
      search: searchParams.get("search") ?? undefined,
      genre: searchParams.get("genre") ?? undefined,
      platform: searchParams.get("platform") ?? undefined,
      minPrice: minPriceParam ? Number(minPriceParam) : undefined,
      maxPrice: maxPriceParam ? Number(maxPriceParam) : undefined,
      sort: sortParam && VALID_SORTS.includes(sortParam as GamesSort) ? (sortParam as GamesSort) : undefined,
      page: pageParam ? Number(pageParam) : 1,
      pageSize: DEFAULT_PAGE_SIZE,
    };
  }, [searchParams]);

  function updateFilters(patch: Partial<Omit<GamesFilters, "pageSize">>) {
    const next = new URLSearchParams(searchParams);

    const merged = { ...filters, ...patch };
    if (!("page" in patch)) {
      merged.page = 1;
    }

    for (const [key, value] of Object.entries(merged)) {
      if (key === "pageSize") continue;
      if (value === undefined || value === "" || value === null) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    }

    setSearchParams(next);
  }

  return { filters, updateFilters };
}
