import axios from "axios";
import { prisma } from "../lib/prisma";
import { env } from "../lib/env";
import { invalidateGamesListCache } from "../utils/cache";
import { derivePrices } from "../lib/pricing";

const RAWG_BASE_URL = "https://api.rawg.io/api";
const DEFAULT_PAGE_SIZE = 20;

interface RawgListItem {
  id: number;
  slug: string;
  name: string;
  background_image: string | null;
  released: string | null;
  rating: number;
  ratings_count: number;
  genres: { name: string }[];
  platforms?: { platform: { name: string } }[];
}

interface RawgPlatformRequirement {
  platform: { name: string };
  requirements_en?: { minimum?: string; recommended?: string };
}

interface RawgDetail {
  description_raw: string | null;
  developers: { name: string }[];
  publishers: { name: string }[];
  platforms?: RawgPlatformRequirement[];
}

interface RawgScreenshotsResponse {
  results: { image: string }[];
}

interface RawgMoviesResponse {
  results: { data: { max?: string; "480"?: string } }[];
}

function rawgClient() {
  if (!env.rawgApiKey) {
    throw new Error(
      "RAWG_API_KEY is not set. Get a free key at https://rawg.io/apidocs and add it to server/.env"
    );
  }
  return axios.create({
    baseURL: RAWG_BASE_URL,
    params: { key: env.rawgApiKey },
    timeout: 15000,
  });
}

function buildSystemRequirements(platforms: RawgPlatformRequirement[] | undefined) {
  const pc = platforms?.find((p) => p.platform.name.toLowerCase() === "pc");
  if (!pc?.requirements_en) return {};
  return {
    minimum: pc.requirements_en.minimum ?? null,
    recommended: pc.requirements_en.recommended ?? null,
  };
}

function buildShortDescription(description: string | null): string {
  if (!description) return "";
  return description.length > 200 ? `${description.slice(0, 197)}...` : description;
}

async function fetchGameExtras(client: ReturnType<typeof rawgClient>, gameId: number) {
  const [detailRes, screenshotsRes, moviesRes] = await Promise.all([
    client.get<RawgDetail>(`/games/${gameId}`),
    client.get<RawgScreenshotsResponse>(`/games/${gameId}/screenshots`),
    client.get<RawgMoviesResponse>(`/games/${gameId}/movies`),
  ]);

  return {
    detail: detailRes.data,
    screenshots: screenshotsRes.data.results.map((s) => s.image),
    trailerUrl: moviesRes.data.results[0]?.data.max ?? moviesRes.data.results[0]?.data["480"] ?? null,
  };
}

async function upsertGame(client: ReturnType<typeof rawgClient>, item: RawgListItem) {
  const externalId = String(item.id);
  const { detail, screenshots, trailerUrl } = await fetchGameExtras(client, item.id);

  const data = {
    title: item.name,
    slug: item.slug,
    description: detail.description_raw ?? "",
    shortDescription: buildShortDescription(detail.description_raw),
    coverUrl: item.background_image ?? "",
    trailerUrl,
    screenshots,
    genres: item.genres.map((g) => g.name),
    platforms: (item.platforms ?? []).map((p) => p.platform.name),
    releaseDate: item.released ? new Date(item.released) : new Date(),
    developer: detail.developers[0]?.name ?? "Unknown",
    publisher: detail.publishers[0]?.name ?? "Unknown",
    systemRequirements: buildSystemRequirements(detail.platforms),
    source: "RAWG" as const,
    externalId,
    avgRating: item.rating ?? 0,
    ratingCount: item.ratings_count ?? 0,
  };

  const existing = await prisma.game.findFirst({ where: { externalId } });

  if (existing) {
    // Preserve prices on update so admin edits / backfills aren't overwritten.
    await prisma.game.update({ where: { id: existing.id }, data });
  } else {
    // New games get derived prices (RAWG provides none).
    await prisma.game.create({ data: { ...data, ...derivePrices(item.rating ?? 0) } });
  }
}

export interface SyncRawgGamesOptions {
  pages?: number;
  pageSize?: number;
}

export interface SyncRawgGamesResult {
  pagesFetched: number;
  gamesSynced: number;
  gamesFailed: number;
}

export async function syncRawgGames(
  options: SyncRawgGamesOptions = {}
): Promise<SyncRawgGamesResult> {
  const pages = options.pages ?? 5;
  const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE;
  const client = rawgClient();

  let gamesSynced = 0;
  let gamesFailed = 0;

  for (let page = 1; page <= pages; page++) {
    const { data } = await client.get<{ results: RawgListItem[] }>("/games", {
      params: { page, page_size: pageSize },
    });

    for (const item of data.results) {
      try {
        await upsertGame(client, item);
        gamesSynced++;
      } catch (err) {
        gamesFailed++;
        console.error(`[rawgSync] failed to sync game "${item.slug}":`, (err as Error).message);
      }
    }
  }

  if (gamesSynced > 0) {
    await invalidateGamesListCache();
  }

  return { pagesFetched: pages, gamesSynced, gamesFailed };
}
