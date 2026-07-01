import { GoogleGenAI } from "@google/genai";
import { env } from "./env";

let client: GoogleGenAI | null = null;

export function getGemini(): GoogleGenAI {
  if (!env.geminiApiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it to server/.env to enable the AI chat agent."
    );
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey: env.geminiApiKey });
  }
  return client;
}

export const AGENT_MODEL = "gemini-2.5-flash";
