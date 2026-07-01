import { Type } from "@google/genai";
import type { FunctionDeclaration } from "@google/genai";
import { listGames, getGameById } from "./games.service";
import { getCart, addToCart, CartError } from "./cart.service";
import { createCheckoutSession, CheckoutError } from "./checkout.service";

export interface AgentAction {
  type: "added_to_cart" | "checkout_started";
  gameId?: string;
  gameTitle?: string;
  planType?: "ONE_TIME" | "SUBSCRIPTION";
  url?: string;
}

export interface ToolExecutionResult {
  content: string;
  action?: AgentAction;
  isError?: boolean;
}

// Function declarations advertised to Gemini. Inputs are validated by us before use.
export const AGENT_TOOLS: FunctionDeclaration[] = [
  {
    name: "search_games",
    description:
      "Search the Eidolon catalog for games. Use this to find games matching the user's interests before recommending or adding anything. Returns up to 10 matches with id, title, genres, prices, and rating.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING, description: "Free-text search over game title and description" },
        genre: { type: Type.STRING, description: "Filter by a single genre, e.g. 'Action' or 'RPG'" },
        maxPrice: { type: Type.NUMBER, description: "Maximum one-time price in USD" },
      },
    },
  },
  {
    name: "get_game_details",
    description:
      "Get full details for one game by its id: description, platforms, prices, developer, rating. Use before recommending a specific title in depth.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        gameId: { type: Type.STRING, description: "The game's id (from search_games results)" },
      },
      required: ["gameId"],
    },
  },
  {
    name: "add_to_cart",
    description:
      "Add a game to the user's cart. ONLY call this after the user has clearly confirmed they want to buy or subscribe to this specific game. Never add a game the user did not explicitly ask to add.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        gameId: { type: Type.STRING, description: "The game's id" },
        planType: {
          type: Type.STRING,
          enum: ["ONE_TIME", "SUBSCRIPTION"],
          description: "ONE_TIME for a permanent purchase, SUBSCRIPTION for the monthly plan",
        },
      },
      required: ["gameId", "planType"],
    },
  },
  {
    name: "get_cart",
    description: "Get the current contents of the user's cart (game titles and chosen plan per item).",
    parameters: { type: Type.OBJECT, properties: {} },
  },
  {
    name: "start_checkout",
    description:
      "Begin Stripe checkout for everything currently in the cart and return a checkout URL. ONLY call this when the user has clearly confirmed they want to check out and pay now.",
    parameters: { type: Type.OBJECT, properties: {} },
  },
];

function summarizeGame(game: {
  id: string;
  title: string;
  genres: string[];
  priceOneTime: number | null;
  priceMonthly: number | null;
  avgRating: number;
}) {
  return {
    id: game.id,
    title: game.title,
    genres: game.genres,
    priceOneTime: game.priceOneTime,
    priceMonthly: game.priceMonthly,
    avgRating: game.avgRating,
  };
}

export async function executeAgentTool(
  userId: string,
  name: string,
  input: Record<string, unknown>
): Promise<ToolExecutionResult> {
  try {
    switch (name) {
      case "search_games": {
        const result = await listGames({
          search: typeof input.query === "string" ? input.query : undefined,
          genre: typeof input.genre === "string" ? input.genre : undefined,
          maxPrice: typeof input.maxPrice === "number" ? input.maxPrice : undefined,
          sort: "rating",
          page: 1,
          pageSize: 10,
        });
        return {
          content: JSON.stringify({
            total: result.total,
            items: result.items.map(summarizeGame),
          }),
        };
      }

      case "get_game_details": {
        const game = await getGameById(String(input.gameId));
        if (!game) {
          return { content: JSON.stringify({ error: "Game not found" }), isError: true };
        }
        return {
          content: JSON.stringify({
            id: game.id,
            title: game.title,
            description: game.shortDescription,
            genres: game.genres,
            platforms: game.platforms,
            developer: game.developer,
            publisher: game.publisher,
            priceOneTime: game.priceOneTime,
            priceMonthly: game.priceMonthly,
            avgRating: game.avgRating,
            ratingCount: game.ratingCount,
          }),
        };
      }

      case "add_to_cart": {
        const gameId = String(input.gameId);
        const planType = input.planType === "SUBSCRIPTION" ? "SUBSCRIPTION" : "ONE_TIME";
        const game = await getGameById(gameId);
        if (!game) {
          return { content: JSON.stringify({ error: "Game not found" }), isError: true };
        }
        await addToCart(userId, gameId, planType);
        return {
          content: JSON.stringify({ success: true, added: game.title, planType }),
          action: { type: "added_to_cart", gameId, gameTitle: game.title, planType },
        };
      }

      case "get_cart": {
        const items = await getCart(userId);
        return {
          content: JSON.stringify({
            items: items.map((item) => ({
              gameId: item.game.id,
              title: item.game.title,
              planType: item.planType,
              priceOneTime: item.game.priceOneTime,
              priceMonthly: item.game.priceMonthly,
            })),
          }),
        };
      }

      case "start_checkout": {
        const { url } = await createCheckoutSession(userId);
        return {
          content: JSON.stringify({ success: true, checkoutUrl: url }),
          action: { type: "checkout_started", url },
        };
      }

      default:
        return { content: JSON.stringify({ error: `Unknown tool: ${name}` }), isError: true };
    }
  } catch (err) {
    if (err instanceof CartError || err instanceof CheckoutError) {
      return { content: JSON.stringify({ error: err.message }), isError: true };
    }
    throw err;
  }
}
