import { z } from "zod";

export const TiptapNodeSchema: z.ZodType<Record<string, unknown>> = z.lazy(() =>
  z.object({
    type: z.string().min(1).max(40),
    attrs: z.record(z.string(), z.unknown()).optional(),
    content: z.array(TiptapNodeSchema).optional(),
    marks: z
      .array(
        z.object({
          type: z.string().min(1).max(30),
          attrs: z.record(z.string(), z.unknown()).optional(),
        })
      )
      .optional(),
    text: z.string().max(50000).optional(),
  })
);

export const UpsertArticleSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(180, "Title cannot exceed 180 characters"),
  subtitle: z.string().trim().max(280, "Subtitle cannot exceed 280 characters").optional().nullable(),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(96)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers, and hyphens")
    .optional(),
  excerpt: z.string().trim().max(600, "Excerpt cannot exceed 600 characters").optional().nullable(),
  contentJson: TiptapNodeSchema,
  contentHtml: z.string().max(150000, "Article body exceeds maximum allowed size"),
  categoryId: z.string().cuid().optional().nullable(),
  tagNames: z.array(z.string().trim().min(1).max(35)).max(8).default([]),
  coverImageUrl: z
    .string()
    .trim()
    .refine(
      (val) => !val || /^(https:\/\/|\/images\/|\/uploads\/)/.test(val),
      "Cover image must be a valid HTTPS URL or managed local upload path"
    )
    .optional()
    .nullable(),
  coverImageAlt: z.string().trim().max(220, "Alt text cannot exceed 220 characters").optional().nullable(),
  seoTitle: z.string().trim().max(70, "SEO title should be under 70 characters").optional().nullable(),
  seoDescription: z.string().trim().max(165, "Meta description should be under 165 characters").optional().nullable(),
  primaryKeyword: z.string().trim().max(80).optional().nullable(),
  clientUpdatedAt: z.string().datetime().optional(),
});

export const ArticleSearchQuerySchema = z.object({
  q: z.string().trim().max(120).optional().default(""),
  category: z.string().trim().max(64).optional(),
  tag: z.string().trim().max(64).optional(),
  sort: z.enum(["newest", "popular", "relevant"]).optional().default("newest"),
  page: z.coerce.number().int().min(1).max(1000).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(9),
});
