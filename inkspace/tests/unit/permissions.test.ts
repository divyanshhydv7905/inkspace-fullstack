import { describe, it, expect } from "vitest";
import {
  canTransitionArticleState,
  canViewArticle,
  canEditArticleContent,
  canModifyUserRoleOrStatus,
} from "@/lib/permissions/policy";

describe("RBAC & Object-Level Authorization Policy", () => {
  const writerA = { id: "writer-a", role: "WRITER" as const, status: "ACTIVE" as const };
  const writerB = { id: "writer-b", role: "WRITER" as const, status: "ACTIVE" as const };
  const admin = { id: "admin-1", role: "ADMIN" as const, status: "ACTIVE" as const };

  it("prevents writers from directly publishing their own articles", () => {
    const draft = { id: "art-1", authorId: "writer-a", status: "DRAFT" as const };
    expect(canTransitionArticleState(writerA, draft, "PUBLISHED").allowed).toBe(false);
    expect(canTransitionArticleState(writerA, draft, "PENDING_REVIEW").allowed).toBe(true);
  });

  it("prevents writers from viewing or editing another writer's unpublished draft (IDOR protection)", () => {
    const draftA = { id: "art-1", authorId: "writer-a", status: "DRAFT" as const };
    expect(canViewArticle(writerB, draftA)).toBe(false);
    expect(canEditArticleContent(writerB, draftA)).toBe(false);
    expect(canViewArticle(admin, draftA)).toBe(true);
  });

  it("protects administrators against self-demotion and last-admin lockout", () => {
    expect(canModifyUserRoleOrStatus(admin, "admin-1", "WRITER", "ACTIVE", 2).allowed).toBe(false);
    expect(canModifyUserRoleOrStatus(admin, "admin-2", "WRITER", "ACTIVE", 1).allowed).toBe(false);
    expect(canModifyUserRoleOrStatus(admin, "admin-2", "WRITER", "ACTIVE", 2).allowed).toBe(true);
  });
});
