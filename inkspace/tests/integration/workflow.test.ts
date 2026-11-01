import { describe, it, expect } from "vitest";
import { AdminReviewDecisionSchema } from "@/lib/validations/review.schema";
import { sanitizeEditorialHtml } from "@/lib/utils/sanitize";

describe("Editorial Review & Content Security Integration", () => {
  it("enforces mandatory feedback when requesting changes or rejecting", () => {
    const invalidReject = AdminReviewDecisionSchema.safeParse({
      articleId: "art-1",
      decision: "REJECT",
      feedback: "Too short",
    });
    expect(invalidReject.success).toBe(false);

    const validReject = AdminReviewDecisionSchema.safeParse({
      articleId: "art-1",
      decision: "REJECT",
      feedback: "Please provide primary citations for the architectural case studies in Section II.",
    });
    expect(validReject.success).toBe(true);
  });

  it("strips XSS vectors from user-submitted HTML before rendering", () => {
    const malicious = `<p>Valid paragraph</p><script>alert(1)</script><img src="javascript:alert(1)" onerror="alert(2)" /><a href="javascript:evil()">Click</a>`;
    const clean = sanitizeEditorialHtml(malicious);
    expect(clean).not.toContain("<script>");
    expect(clean).not.toContain("javascript:");
    expect(clean).not.toContain("onerror");
    expect(clean).toContain("<p>Valid paragraph</p>");
  });
});
