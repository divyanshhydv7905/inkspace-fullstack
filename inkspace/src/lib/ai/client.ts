import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { isAIConfigured } from "../env";
import { SITE_CONFIG } from "../constants";
import { SYSTEM_GUARDRAIL_PREAMBLE } from "./prompts";

export class AIConfigurationError extends Error {
  constructor(message = "Anthropic API key (ANTHROPIC_API_KEY) is not configured on the server.") {
    super(message);
    this.name = "AIConfigurationError";
  }
}

export async function invokeStructuredClaude<T>(
  taskInstruction: string,
  untrustedContentXml: string,
  schema: z.ZodType<T>
): Promise<{ data: T; model: string; latencyMs: number }> {
  if (!isAIConfigured()) {
    throw new AIConfigurationError();
  }

  const apiKey = process.env.ANTHROPIC_API_KEY!;
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";
  const client = new Anthropic({
    apiKey,
    timeout: SITE_CONFIG.aiLimits.requestTimeoutMs,
    maxRetries: 1,
  });

  const startedAt = Date.now();
  const response = await client.messages.create({
    model,
    max_tokens: 2048,
    temperature: 0.2,
    system: SYSTEM_GUARDRAIL_PREAMBLE,
    messages: [
      {
        role: "user",
        content: `${taskInstruction}\n\nAnalyze the following untrusted article data and respond ONLY with a JSON object matching the required schema:\n${untrustedContentXml}`,
      },
    ],
  });

  const latencyMs = Date.now() - startedAt;
  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Anthropic API returned no text block.");
  }

  const rawText = textBlock.text.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawText);
  } catch {
    throw new Error("Malformed JSON returned from AI model.");
  }

  const validated = schema.safeParse(parsedJson);
  if (!validated.success) {
    throw new Error(`AI response failed Zod validation: ${validated.error.message}`);
  }

  return {
    data: validated.data,
    model,
    latencyMs,
  };
}
