import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";
import { generateSlug, resolveSlugCollision, estimateReadingTimeMinutes } from "../utils/slug";
import { sanitizeEditorialHtml } from "../utils/sanitize";
import {
  ActorContext,
  assertActiveAccount,
  canEditArticleContent,
  canTransitionArticleState,
  canViewArticle,
} from "../permissions/policy";
import { UpsertArticleSchema, ArticleSearchQuerySchema } from "../validations/article.schema";
import { enqueueArticleModerationJob, processModerationJob } from "../ai/workflows/moderation-job";

export async function listPublicArticles(rawQuery: Record<string, unknown>) {
  const query = ArticleSearchQuerySchema.parse(rawQuery);
  const skip = (query.page - 1) * query.pageSize;

  const where: Prisma.ArticleWhereInput = {
    status: "PUBLISHED",
    ...(query.category ? { category: { slug: query.category } } : {}),
    ...(query.tag ? { tags: { some: { tag: { slug: query.tag } } } } : {}),
    ...(query.q
      ? {
          OR: [
            { title: { contains: query.q, mode: "insensitive" } },
            { subtitle: { contains: query.q, mode: "insensitive" } },
            { excerpt: { contains: query.q, mode: "insensitive" } },
            { contentHtml: { contains: query.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const orderBy: Prisma.ArticleOrderByWithRelationInput =
    query.sort === "popular"
      ? { viewCount: "desc" }
      : { publishedAt: "desc" };

  const [items, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy,
      skip,
      take: query.pageSize,
      select: {
        id: true,
        title: true,
        subtitle: true,
        slug: true,
        excerpt: true,
        coverImageUrl: true,
        coverImageAlt: true,
        readingTimeMinutes: true,
        publishedAt: true,
        viewCount: true,
        isFeatured: true,
        isEditorsPick: true,
        isSeedData: true,
        author: { select: { id: true, name: true, avatarUrl: true } },
        category: { select: { id: true, name: true, slug: true } },
        tags: { select: { tag: { select: { id: true, name: true, slug: true } } } },
      },
    }),
    prisma.article.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
    },
  };
}

export async function getPublicArticleBySlug(slug: string, viewerActor?: ActorContext | null) {
  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      author: { select: { id: true, name: true, bio: true, avatarUrl: true } },
      category: { select: { id: true, name: true, slug: true } },
      tags: { include: { tag: true } },
    },
  });

  if (!article) return null;

  if (!canViewArticle(viewerActor, { id: article.id, authorId: article.authorId, status: article.status })) {
    return null;
  }

  return article;
}

export async function saveArticleDraft(
  actor: ActorContext,
  input: unknown,
  existingArticleId?: string
) {
  assertActiveAccount(actor);
  const data = UpsertArticleSchema.parse(input);
  const sanitizedHtml = sanitizeEditorialHtml(data.contentHtml);
  const readingTimeMinutes = estimateReadingTimeMinutes(sanitizedHtml);

  if (!existingArticleId) {
    // Creating a new draft
    const desiredSlug = data.slug ? generateSlug(data.slug) : generateSlug(data.title);
    const conflictingSlugs = await prisma.article.findMany({
      where: { slug: { startsWith: desiredSlug } },
      select: { slug: true },
    });
    const uniqueSlug = resolveSlugCollision(
      desiredSlug,
      conflictingSlugs.map((s) => s.slug)
    );

    return prisma.$transaction(async (tx) => {
      const created = await tx.article.create({
        data: {
          authorId: actor.id,
          categoryId: data.categoryId ?? null,
          title: data.title,
          subtitle: data.subtitle ?? null,
          slug: uniqueSlug,
          excerpt: data.excerpt ?? null,
          contentJson: data.contentJson as Prisma.InputJsonValue,
          contentHtml: sanitizedHtml,
          readingTimeMinutes,
          coverImageUrl: data.coverImageUrl ?? null,
          coverImageAlt: data.coverImageAlt ?? null,
          seoTitle: data.seoTitle ?? null,
          seoDescription: data.seoDescription ?? null,
          primaryKeyword: data.primaryKeyword ?? null,
          status: "DRAFT",
        },
      });

      await tx.articleRevision.create({
        data: {
          articleId: created.id,
          authorId: actor.id,
          versionNumber: 1,
          title: created.title,
          subtitle: created.subtitle,
          excerpt: created.excerpt,
          contentJson: data.contentJson as Prisma.InputJsonValue,
          changeSummary: "Initial draft created",
        },
      });

      return created;
    });
  }

  // Updating an existing article
  const existing = await prisma.article.findUnique({ where: { id: existingArticleId } });
  if (!existing) {
    throw new Error("NOT_FOUND: Article does not exist.");
  }

  if (!canEditArticleContent(actor, { id: existing.id, authorId: existing.authorId, status: existing.status })) {
    throw new Error("FORBIDDEN: You do not have permission to edit this article in its current state.");
  }

  // Stale autosave protection
  if (data.clientUpdatedAt) {
    const clientTime = new Date(data.clientUpdatedAt).getTime();
    if (clientTime < existing.updatedAt.getTime() - 1000) {
      throw new Error("CONFLICT: A newer version of this draft already exists on the server.");
    }
  }

  let nextSlug = existing.slug;
  if (data.slug && generateSlug(data.slug) !== existing.slug) {
    const candidate = generateSlug(data.slug);
    const conflict = await prisma.article.findFirst({
      where: { slug: candidate, id: { not: existing.id } },
      select: { id: true },
    });
    if (conflict) {
      throw new Error("SLUG_COLLISION: That URL slug is already in use by another article.");
    }
    nextSlug = candidate;
  }

  return prisma.$transaction(async (tx) => {
    const latestRevision = await tx.articleRevision.findFirst({
      where: { articleId: existing.id },
      orderBy: { versionNumber: "desc" },
      select: { versionNumber: true },
    });

    const nextVersion = (latestRevision?.versionNumber ?? 0) + 1;
    // If an admin or writer edits an article that had changes requested, keep or reset to DRAFT as appropriate
    const updated = await tx.article.update({
      where: { id: existing.id },
      data: {
        title: data.title,
        subtitle: data.subtitle ?? null,
        slug: nextSlug,
        excerpt: data.excerpt ?? null,
        contentJson: data.contentJson as Prisma.InputJsonValue,
        contentHtml: sanitizedHtml,
        readingTimeMinutes,
        categoryId: data.categoryId ?? null,
        coverImageUrl: data.coverImageUrl ?? null,
        coverImageAlt: data.coverImageAlt ?? null,
        seoTitle: data.seoTitle ?? null,
        seoDescription: data.seoDescription ?? null,
        primaryKeyword: data.primaryKeyword ?? null,
      },
    });

    await tx.articleRevision.create({
      data: {
        articleId: existing.id,
        authorId: actor.id,
        versionNumber: nextVersion,
        title: updated.title,
        subtitle: updated.subtitle,
        excerpt: updated.excerpt,
        contentJson: data.contentJson as Prisma.InputJsonValue,
        changeSummary: `Draft autosaved (v${nextVersion})`,
      },
    });

    return updated;
  });
}

export async function submitArticleForReview(actor: ActorContext, articleId: string) {
  assertActiveAccount(actor);
  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article) {
    throw new Error("NOT_FOUND: Article not found.");
  }

  const check = canTransitionArticleState(
    actor,
    { id: article.id, authorId: article.authorId, status: article.status },
    "PENDING_REVIEW"
  );
  if (!check.allowed) {
    throw new Error(`FORBIDDEN: ${check.reason}`);
  }

  if (article.title.trim().length < 5 || article.contentHtml.trim().length < 80) {
    throw new Error("VALIDATION_ERROR: Article requires a complete title and substantive body before submission.");
  }

  const updated = await prisma.article.update({
    where: { id: article.id },
    data: {
      status: "PENDING_REVIEW",
      submittedAt: new Date(),
    },
  });

  // Schedule bounded AI moderation & quality assessment job without blocking human submission
  try {
    const job = await enqueueArticleModerationJob(article.id);
    if (job) {
      void processModerationJob(job.id).catch(() => {
        // Logged in AIJob.lastError; never crashes or blocks submission
      });
    }
  } catch {
    // Non-fatal: human review proceeds even if job scheduling fails
  }

  return updated;
}
