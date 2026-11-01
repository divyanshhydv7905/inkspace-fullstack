import { describe, it, expect } from "vitest";
import { generateSlug, resolveSlugCollision, estimateReadingTimeMinutes } from "@/lib/utils/slug";

describe("Slug Generation & Collision Resolution", () => {
  it("normalizes diacritics, punctuation, and whitespace into clean SEO slugs", () => {
    expect(generateSlug("  The Architecture of Quiet Interfaces: Part I! ")).toBe(
      "the-architecture-of-quiet-interfaces-part-i"
    );
    expect(generateSlug("Café & Résumé — Édition 2026")).toBe("cafe-resume-edition-2026");
  });

  it("resolves collisions deterministically with numeric suffixes", () => {
    const existing = new Set(["quiet-interfaces", "quiet-interfaces-2"]);
    expect(resolveSlugCollision("Quiet Interfaces", existing)).toBe("quiet-interfaces-3");
  });

  it("estimates reading time accurately with a 1-minute floor", () => {
    expect(estimateReadingTimeMinutes("<p>Short note.</p>")).toBe(1);
    const words450 = new Array(450).fill("editorial").join(" ");
    expect(estimateReadingTimeMinutes(words450)).toBe(3);
  });
});
