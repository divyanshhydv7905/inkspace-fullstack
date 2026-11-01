import { prisma } from "../../prisma";
import { isAIConfigured } from "../../env";
import { invokeStructuredClaude } from "../client";
import { buildUntrustedContentEnvelope } from "../prompts";
import { ModerationAssessmentResponseSchema, EditorialQualityResponseSchema } from "../schemas";

/**
 * Enqueues an idempotent AI moderation and editorial review job when an article enters PENDING_REVIEW.
 * Never blocks the human submission if AI is unconfigured or unavailable.
 */
export async function enqueueArticleModerationJob(articleId: string) {
  const existingActiveJob = await prisma.aIJob.findFirst({
    where: {
      articleId,
      jobType: "MODERATION_ASSESSMENT",
      status: { in: ["PENDING", "PROCESSING"] },
    },
  });

  if (existingActiveJob) {
    return existingActiveJob;
  }

  return prisma.aIJob.create({
    data: {
      articleId,
      jobType: "MODERATION_ASSESSMENT",
      status: "PENDING",
      maxAttempts: 3,
    },
  });
}

/**
 * Safely claims and executes a pending AI moderation job with retry accounting and failure isolation.
 */
export async function processModerationJob(jobId: string, workerId = "server-inline-worker") {
  const job = await prisma.aIJob.findUnique({
    where: { id: jobId },
    include: { article: true },
  });

  if (!job || job.status === "COMPLETED" || job.attempts >= job.maxAttempts) {
    return null;
  }

  // Optimistic lock claim
  const claimed = await prisma.aIJob.updateMany({
    where: {
      id: jobId,
      status: { in: ["PENDING", "FAILED"] },
    },
    data: {
      status: "PROCESSING",
      lockedAt: new Date(),
      lockedBy: workerId,
      attempts: { increment: 1 },
    },
  });

  if (claimed.count === 0) {
    return null;
  }

  if (!isAIConfigured()) {
    await prisma.aIJob.update({
      where: { id: jobId },
      data: {
        status: "FAILED",
        lastError: "ANTHROPIC_API_KEY is not configured. Human review remains unblocked.",
      },
    });
    return null;
  }

  try {
    const envelope = buildUntrustedContentEnvelope(
      job.article.title,
      job.article.contentHtml,
      job.article.excerpt || ""
    );

    const [moderationResult, qualityResult] = await Promise.all([
      invokeStructuredClaude(
        "Perform an advisory moderation assessment checking for spam indicators, suspicious links, policy concerns, confidence level, and recommended human review priority.",
        envelope,
        ModerationAssessmentResponseSchema
      ),
      invokeStructuredClaude(
        "Perform an editorial quality assessment checking readability, structure, unsupported claims, missing attribution, and clarity improvements.",
        envelope,
        EditorialQualityResponseSchema
      ),
    ]);

    await prisma.$transaction([
      prisma.aIReview.create({
        data: {
          articleId: job.articleId,
          reviewType: "MODERATION_ASSESSMENT",
          structuredResult: moderationResult.data,
          modelIdentifier: moderationResult.model,
          processingStatus: "COMPLETED",
          latencyMs: moderationResult.latencyMs,
        },
      }),
      prisma.aIReview.create({
        data: {
          articleId: job.articleId,
          reviewType: "EDITORIAL_QUALITY",
          structuredResult: qualityResult.data,
          modelIdentifier: qualityResult.model,
          processingStatus: "COMPLETED",
          latencyMs: qualityResult.latencyMs,
        },
      }),
      prisma.aIJob.update({
        where: { id: jobId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          lastError: null,
        },
      }),
    ]);

    return { moderation: moderationResult.data, quality: qualityResult.data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown AI job error";
    await prisma.aIJob.update({
      where: { id: jobId },
      data: {
        status: "FAILED",
        lastError: message.slice(0, 1000),
      },
    });
    return null;
  }
}
