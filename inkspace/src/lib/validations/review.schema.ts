import { z } from "zod";

export const AdminReviewDecisionSchema = z
  .object({
    articleId: z.string().min(1),
    decision: z.enum(["APPROVE", "PUBLISH", "REQUEST_CHANGES", "REJECT", "ARCHIVE", "UNPUBLISH"]),
    feedback: z.string().trim().max(4000).optional().default(""),
  })
  .superRefine((data, ctx) => {
    if (
      (data.decision === "REQUEST_CHANGES" || data.decision === "REJECT") &&
      data.feedback.trim().length < 15
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["feedback"],
        message: "A clear explanation of at least 15 characters is mandatory when requesting changes or rejecting an article.",
      });
    }
  });
