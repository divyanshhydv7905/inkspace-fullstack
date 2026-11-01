import { ActorContext, assertActiveAccount } from "../permissions/policy";
import { checkRateLimit } from "../utils/rate-limit";
import { SITE_CONFIG } from "../constants";
import { invokeStructuredClaude } from "../ai/client";
import { buildUntrustedContentEnvelope } from "../ai/prompts";
import {
  WritingCopilotRequestSchema,
  WritingCopilotResponseSchema,
  SEOAssistantResponseSchema,
  EditorialQualityResponseSchema,
} from "../ai/schemas";

export async function runWritingCopilot(actor: ActorContext, rawInput: unknown) {
  assertActiveAccount(actor);
  const rate = checkRateLimit(
    `ai:${actor.id}`,
    SITE_CONFIG.aiLimits.rateLimitPerMinute,
    60_000
  );
  if (!rate.allowed) {
    throw new Error("RATE_LIMITED: AI request limit reached. Please wait briefly before running another assistant action.");
  }

  const input = WritingCopilotRequestSchema.parse(rawInput);
  const envelope = buildUntrustedContentEnvelope(input.title, input.articleBody, input.selectedText);

  const instruction = `Execute writing copilot action "${input.action}" using tone "${input.requestedTone}". Provide primarySuggestion, alternatives, suggestedTags, suggestedCategory, and editorialNotes.`;
  const result = await invokeStructuredClaude(instruction, envelope, WritingCopilotResponseSchema);
  return result.data;
}

export async function runSEOAssistant(actor: ActorContext, title: string, articleBody: string) {
  assertActiveAccount(actor);
  const rate = checkRateLimit(`ai:${actor.id}`, SITE_CONFIG.aiLimits.rateLimitPerMinute, 60_000);
  if (!rate.allowed) {
    throw new Error("RATE_LIMITED: AI request limit reached.");
  }

  const envelope = buildUntrustedContentEnvelope(title, articleBody);
  const instruction =
    "Generate structured SEO metadata including seoTitle, metaDescription, suggestedSlug, primaryKeyword, relatedKeywords, suggestedHeadings, internalLinkingOpportunities, and imageAltTextSuggestions.";
  const result = await invokeStructuredClaude(instruction, envelope, SEOAssistantResponseSchema);
  return result.data;
}

export async function runEditorialQualityReview(actor: ActorContext, title: string, articleBody: string) {
  assertActiveAccount(actor);
  const rate = checkRateLimit(`ai:${actor.id}`, SITE_CONFIG.aiLimits.rateLimitPerMinute, 60_000);
  if (!rate.allowed) {
    throw new Error("RATE_LIMITED: AI request limit reached.");
  }

  const envelope = buildUntrustedContentEnvelope(title, articleBody);
  const instruction =
    "Evaluate editorial quality, readability, grammar/clarity issues, repetition warnings, structural issues, unsupported factual-claim warnings, potentially misleading wording, and missing attribution warnings.";
  const result = await invokeStructuredClaude(instruction, envelope, EditorialQualityResponseSchema);
  return result.data;
}
