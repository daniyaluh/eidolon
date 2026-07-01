import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { sendChatMessage, ChatError } from "../services/chatAgent.service";

const messageSchema = z.object({
  content: z.string().trim().min(1).max(2000),
});

export async function createSession(req: Request, res: Response) {
  const session = await prisma.chatSession.create({
    data: { userId: req.user!.id },
  });
  return res.status(201).json({ id: session.id, createdAt: session.createdAt });
}

export async function postMessage(req: Request, res: Response) {
  const parsed = messageSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid message", details: parsed.error.flatten() });
  }

  try {
    const result = await sendChatMessage(req.user!.id, req.params.id, parsed.data.content);
    return res.json(result);
  } catch (err) {
    if (err instanceof ChatError) {
      return res.status(err.status).json({ error: err.message });
    }
    if (err instanceof Error && err.message.includes("GEMINI_API_KEY")) {
      return res.status(503).json({ error: "AI assistant is not configured yet." });
    }
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("503") || msg.includes("UNAVAILABLE") || msg.includes("overloaded") || msg.includes("RESOURCE_EXHAUSTED")) {
      return res.status(503).json({ error: "The assistant is briefly overloaded. Please try again in a moment." });
    }
    throw err;
  }
}
