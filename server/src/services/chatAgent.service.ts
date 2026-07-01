import { Content, Part, GenerateContentParameters, GenerateContentResponse } from "@google/genai";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { getGemini, AGENT_MODEL } from "../lib/gemini";
import { AGENT_TOOLS, executeAgentTool, AgentAction } from "./agentTools";

const MAX_TOOL_ITERATIONS = 8;
const HISTORY_LIMIT = 20;

export class ChatError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "ChatError";
    this.status = status;
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isTransient(err: unknown): boolean {
  const msg = String((err as Error)?.message ?? err);
  return (
    msg.includes("503") ||
    msg.includes("UNAVAILABLE") ||
    msg.includes("overloaded") ||
    msg.includes("high demand") ||
    msg.includes("RESOURCE_EXHAUSTED")
  );
}

// The free Gemini tier intermittently returns 503 (overloaded) / 429 — retry
// a few times with backoff before surfacing the error.
async function generateWithRetry(
  call: () => Promise<GenerateContentResponse>,
  retries = 3
): Promise<GenerateContentResponse> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await call();
    } catch (err) {
      lastErr = err;
      if (isTransient(err) && attempt < retries) {
        await sleep(800 * (attempt + 1));
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

const SYSTEM_PROMPT = `You are Eidolon's friendly shopping assistant — a concise, genuinely knowledgeable PC-games expert who helps people discover games and, when they're ready, buy or subscribe to them.

Guidelines:
- Be warm and brief. Recommend a few well-matched games, not a wall of text.
- Use the search_games and get_game_details tools to ground every recommendation in our actual catalog. Never invent games, prices, or details.
- Only call add_to_cart after the user has clearly confirmed they want that specific game. Never add something they didn't ask for.
- Only call start_checkout when the user has clearly said they want to check out and pay now. Never complete a purchase the user didn't explicitly request — when unsure, ask first.
- After adding to the cart or starting checkout, briefly confirm what you did.`;

async function buildUserContext(userId: string): Promise<string> {
  const [library, wishlist, reviews] = await Promise.all([
    prisma.libraryEntry.findMany({
      where: { userId },
      include: { game: { select: { title: true } } },
      take: 30,
    }),
    prisma.wishlistItem.findMany({
      where: { userId },
      include: { game: { select: { title: true } } },
      take: 30,
    }),
    prisma.review.findMany({
      where: { userId },
      include: { game: { select: { title: true } } },
      take: 30,
    }),
  ]);

  const owned = library.map((e) => e.game.title);
  const wished = wishlist.map((w) => w.game.title);
  const reviewed = reviews.map((r) => `${r.game.title} (${r.rating}/5)`);

  const lines = [
    `Games owned: ${owned.length ? owned.join(", ") : "none"}`,
    `Wishlist: ${wished.length ? wished.join(", ") : "none"}`,
    `Reviewed: ${reviewed.length ? reviewed.join(", ") : "none"}`,
  ];
  return `Here is the current user's profile to personalize recommendations (do not read it back verbatim):\n${lines.join("\n")}`;
}

async function loadHistory(sessionId: string): Promise<Content[]> {
  const rows = await prisma.chatMessage.findMany({
    where: { sessionId, role: { in: ["USER", "ASSISTANT"] } },
    orderBy: { createdAt: "desc" },
    take: HISTORY_LIMIT,
  });

  const contents: Content[] = rows
    .reverse()
    .filter((row) => row.content.trim().length > 0)
    .map((row) => ({
      role: row.role === "USER" ? "user" : "model",
      parts: [{ text: row.content }],
    }));

  // Gemini requires the first turn to be from the user.
  while (contents.length > 0 && contents[0].role !== "user") {
    contents.shift();
  }
  return contents;
}

function toResponseObject(content: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(content);
    return typeof parsed === "object" && parsed !== null ? parsed : { result: parsed };
  } catch {
    return { result: content };
  }
}

export interface SendMessageResult {
  reply: string;
  actions: AgentAction[];
}

export async function sendChatMessage(
  userId: string,
  sessionId: string,
  userMessage: string
): Promise<SendMessageResult> {
  const session = await prisma.chatSession.findUnique({ where: { id: sessionId } });
  if (!session || session.userId !== userId) {
    throw new ChatError("Chat session not found", 404);
  }

  const ai = getGemini();

  // Persist the user's message before we build history so it's included.
  await prisma.chatMessage.create({
    data: { sessionId, role: "USER", content: userMessage },
  });

  const context = await buildUserContext(userId);
  const contents = await loadHistory(sessionId);

  const actions: AgentAction[] = [];
  let finalText = "";

  for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
    const request: GenerateContentParameters = {
      model: AGENT_MODEL,
      contents,
      config: {
        systemInstruction: `${SYSTEM_PROMPT}\n\n${context}`,
        tools: [{ functionDeclarations: AGENT_TOOLS }],
        // Disable "thinking" so the model spends its output budget on the
        // actual reply (keeps the shopping chat fast and avoids truncation).
        thinkingConfig: { thinkingBudget: 0 },
        maxOutputTokens: 2048,
      },
    };
    const response = await generateWithRetry(() => ai.models.generateContent(request));

    const modelContent = response.candidates?.[0]?.content;
    if (modelContent) {
      // Echo the model turn back verbatim (preserves function_call parts).
      contents.push(modelContent);
    }

    const calls = response.functionCalls ?? [];
    const text = (response.text ?? "").trim();
    if (text) finalText = text;

    // Persist the assistant turn (text + any tool calls) for the record.
    await prisma.chatMessage.create({
      data: {
        sessionId,
        role: "ASSISTANT",
        content: finalText,
        toolCalls: calls.length
          ? (calls.map((c) => ({ name: c.name, args: c.args })) as Prisma.InputJsonValue)
          : undefined,
      },
    });

    if (calls.length === 0) break;

    const responseParts: Part[] = [];
    for (const call of calls) {
      const result = await executeAgentTool(
        userId,
        call.name ?? "",
        (call.args ?? {}) as Record<string, unknown>
      );
      if (result.action) actions.push(result.action);
      responseParts.push({
        functionResponse: {
          name: call.name ?? "",
          response: toResponseObject(result.content),
        },
      });
    }

    // Persist tool results for audit (not replayed into future LLM history).
    await prisma.chatMessage.create({
      data: {
        sessionId,
        role: "TOOL",
        content: JSON.stringify(responseParts.map((p) => p.functionResponse)),
        toolCalls: responseParts as unknown as Prisma.InputJsonValue,
      },
    });

    contents.push({ role: "user", parts: responseParts });
  }

  if (!finalText) {
    finalText = "Sorry, I wasn't able to come up with a response. Could you rephrase?";
  }

  return { reply: finalText, actions };
}
