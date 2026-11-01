import { ArticleStatus, NotificationType } from "@prisma/client";
import { prisma } from "../prisma";
import { ActorContext, canAccessAdminPanel, canTransitionArticleState } from "../permissions/policy";
import { AdminReviewDecisionSchema } from "../validations/review.schema";

const DECISION_TO_STATUS: Record<string, ArticleStatus> = {
  APPROVE: "APPROVED",
  PUBLISH: "PUBLISHED",
  REQUEST_CHANGES: "CHANGES_REQUESTED",
  REJECT: "REJECTED",
  ARCHIVE: "ARCHIVED",
  UNPUBLISH: "DRAFT",
};

const DECISION_TO_NOTIFICATION: Record<string, NotificationType> = {
  APPROVE: "ARTICLE_APPROVED",
  PUBLISH: "ARTICLE_PUBLISHED",
  REQUEST_CHANGES: "CHANGES_REQUESTED",
  REJECT: "ARTICLE_REJECTED",
  ARCHIVE: "SYSTEM_ALERT",
  UNPUBLISH: "SYSTEM_ALERT",
};

export async function executeAdminReviewDecision(actor: ActorContext, rawInput: unknown) {
  if (!canAccessAdminPanel(actor)) {
    throw new Error("FORBIDDEN: Administrator privileges required.");
  }

  const input = AdminReviewDecisionSchema.parse(rawInput);
  const article = await prisma.article.findUnique({
    where: { id: input.articleId },
    include: { author: { select: { id: true, name: true, email: true } } },
  });

  if (!article) {
    throw new Error("NOT_FOUND: Article not found.");
  }

  const targetStatus = DECISION_TO_STATUS[input.decision]!;
  const transition = canTransitionArticleState(
    actor,
    { id: article.id, authorId: article.authorId, status: article.status },
    targetStatus
  );

  if (!transition.allowed) {
    throw new Error(`INVALID_TRANSITION: ${transition.reason}`);
  }

  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const updatedArticle = await tx.article.update({
      where: { id: article.id },
      data: {
        status: targetStatus,
        ...(targetStatus === "APPROVED" ? { approvedAt: now } : {}),
        ...(targetStatus === "PUBLISHED" ? { publishedAt: article.publishedAt ?? now, approvedAt: article.approvedAt ?? now } : {}),
        ...(targetStatus === "ARCHIVED" ? { archivedAt: now } : {}),
      },
    });

    const reviewRecord = await tx.review.create({
      data: {
        articleId: article.id,
        reviewerId: actor.id,
        decision: input.decision,
        feedback: input.feedback || `Status updated to ${targetStatus}`,
        previousStatus: article.status,
        newStatus: targetStatus,
      },
    });

    await tx.notification.create({
      data: {
        recipientId: article.authorId,
        type: DECISION_TO_NOTIFICATION[input.decision]!,
        title: `Editorial Update: "${article.title}"`,
        message:
          input.feedback.trim().length > 0
            ? input.feedback.trim()
            : `Your article "${article.title}" has been moved to ${targetStatus}.`,
        relatedArticleId: article.id,
        actionUrl: `/dashboard/articles/${article.id}/edit`,
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: actor.id,
        action: `ARTICLE_${input.decision}`,
        targetResourceType: "Article",
        targetResourceId: article.id,
        metadata: {
          previousStatus: article.status,
          newStatus: targetStatus,
          feedbackProvided: Boolean(input.feedback.trim()),
        },
      },
    });

    return { article: updatedArticle, review: reviewRecord };
  });
}
