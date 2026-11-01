import { z } from "zod";

export const WritingCopilotRequestSchema = z.object({
  action: z.enum([
    "GENERATE_OUTLINE",
    "SUGGEST_HEADLINES",
    "IMPROVE_CLARITY",
    "REWRITE_TONE",
    "EXPAND_OUTLINE",
    "SUMMARIZE",
    "SUGGEST_INTRO_CONCLUSION",
    "GENERATE_FAQS",
    "SUGGEST_TAXONOMY",
  ]),
  title: z.string().trim().max(200).optional().default(""),
  selectedText: z.string().trim().max(12000).optional().default(""),
  articleBody: z.string().trim().max(32000).optional().default(""),
  requestedTone: z
    .enum(["EDITORIAL_CALM", "ANALYTICAL", "CONCISE", "NARRATIVE", "ACADEMIC"])
    .optional()
    .default("EDITORIAL_CALM"),
});

export const WritingCopilotResponseSchema = z.object({
  action: z.string(),
  primarySuggestion: z.string().min(1),
  alternatives: z.array(z.string()).max(6).default([]),
  suggestedTags: z.array(z.string()).max(8).default([]),
  suggestedCategory: z.string().optional(),
  editorialNotes: z.string(),
  advisoryDisclaimer: z
    .string()
    .default("AI suggestions are advisory. Review and verify all phrasing and factual claims before inserting into your draft."),
});

export const SEOAssistantResponseSchema = z.object({
  seoTitle: z.string().min(10).max(70),
  metaDescription: z.string().min(40).max(165),
  suggestedSlug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  primaryKeyword: z.string().min(2).max(80),
  relatedKeywords: z.array(z.string()).min(1).max(8),
  suggestedHeadings: z.array(z.string()).min(1).max(6),
  internalLinkingOpportunities: z.array(
    z.object({
      anchorText: z.string(),
      targetTopicOrSlug: z.string(),
      rationale: z.string(),
    })
  ),
  imageAltTextSuggestions: z.array(z.string()).min(1).max(4),
  searchVolumeDisclaimer: z
    .string()
    .default("Keyword suggestions are derived from semantic relevance inside the article text and do not represent verified search engine volume or ranking guarantees."),
});

export const EditorialQualityResponseSchema = z.object({
  overallAssessment: z.string().min(10),
  qualityScore: z.number().int().min(1).max(100),
  readabilityObservations: z.array(z.string()),
  grammarAndClarityIssues: z.array(
    z.object({
      excerpt: z.string(),
      suggestion: z.string(),
      reason: z.string(),
    })
  ),
  repetitionWarnings: z.array(z.string()),
  structuralIssues: z.array(z.string()),
  unsupportedClaimWarnings: z.array(z.string()),
  potentiallyMisleadingWording: z.array(z.string()),
  missingAttributionWarnings: z.array(z.string()),
  suggestedImprovements: z.array(z.string()),
  advisoryNotice: z
    .string()
    .default("Editorial AI analysis is advisory and may be inaccurate. Human writers and editors remain solely responsible for factual verification."),
});

export const ModerationAssessmentResponseSchema = z.object({
  summary: z.string().min(10).max(600),
  policyOrQualityConcerns: z.array(z.string()),
  spamIndicators: z.array(z.string()),
  suspiciousLinkIndicators: z.array(z.string()),
  confidenceLevel: z.enum(["HIGH", "MEDIUM", "LOW"]),
  uncertaintyNotes: z.string(),
  recommendedPriority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]),
  suggestedReviewerActions: z.array(z.string()),
  humanAuthorityNotice: z
    .string()
    .default("Automated moderation assessment is non-binding. Human administrators hold exclusive authority to approve, request changes, reject, or publish."),
});
