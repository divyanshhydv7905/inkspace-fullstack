export type Role = "READER" | "WRITER" | "ADMIN";
export type AccountStatusType = "ACTIVE" | "SUSPENDED";
export type ArticleState =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "CHANGES_REQUESTED"
  | "APPROVED"
  | "PUBLISHED"
  | "REJECTED"
  | "ARCHIVED";

export interface ActorContext {
  id: string;
  role: Role;
  status: AccountStatusType;
}

export interface ArticleResource {
  id: string;
  authorId: string;
  status: ArticleState;
}

const WRITER_EDITABLE_STATES: ReadonlySet<ArticleState> = new Set([
  "DRAFT",
  "CHANGES_REQUESTED",
  "REJECTED",
]);

const VALID_TRANSITIONS: Record<ArticleState, ReadonlyMap<ArticleState, ReadonlySet<Role>>> = {
  DRAFT: new Map([
    ["PENDING_REVIEW", new Set<Role>(["WRITER", "ADMIN"])],
    ["ARCHIVED", new Set<Role>(["WRITER", "ADMIN"])],
  ]),
  PENDING_REVIEW: new Map([
    ["DRAFT", new Set<Role>(["WRITER", "ADMIN"])],
    ["CHANGES_REQUESTED", new Set<Role>(["ADMIN"])],
    ["APPROVED", new Set<Role>(["ADMIN"])],
    ["PUBLISHED", new Set<Role>(["ADMIN"])],
    ["REJECTED", new Set<Role>(["ADMIN"])],
  ]),
  CHANGES_REQUESTED: new Map([
    ["DRAFT", new Set<Role>(["WRITER", "ADMIN"])],
    ["PENDING_REVIEW", new Set<Role>(["WRITER", "ADMIN"])],
    ["ARCHIVED", new Set<Role>(["WRITER", "ADMIN"])],
  ]),
  APPROVED: new Map([
    ["PUBLISHED", new Set<Role>(["ADMIN"])],
    ["CHANGES_REQUESTED", new Set<Role>(["ADMIN"])],
    ["REJECTED", new Set<Role>(["ADMIN"])],
    ["ARCHIVED", new Set<Role>(["ADMIN"])],
  ]),
  PUBLISHED: new Map([
    ["ARCHIVED", new Set<Role>(["ADMIN"])],
    ["DRAFT", new Set<Role>(["ADMIN"])],
    ["CHANGES_REQUESTED", new Set<Role>(["ADMIN"])],
  ]),
  REJECTED: new Map([
    ["DRAFT", new Set<Role>(["WRITER", "ADMIN"])],
    ["ARCHIVED", new Set<Role>(["WRITER", "ADMIN"])],
  ]),
  ARCHIVED: new Map([
    ["DRAFT", new Set<Role>(["ADMIN"])],
  ]),
};

export function assertActiveAccount(actor: ActorContext | null | undefined): asserts actor is ActorContext {
  if (!actor) {
    throw new Error("UNAUTHORIZED: Authentication required.");
  }
  if (actor.status !== "ACTIVE") {
    throw new Error("FORBIDDEN: Account is suspended.");
  }
}

export function canAccessAdminPanel(actor: ActorContext | null | undefined): boolean {
  return Boolean(actor && actor.status === "ACTIVE" && actor.role === "ADMIN");
}

export function canViewArticle(actor: ActorContext | null | undefined, article: ArticleResource): boolean {
  if (article.status === "PUBLISHED") {
    return true;
  }
  if (!actor || actor.status !== "ACTIVE") {
    return false;
  }
  if (actor.role === "ADMIN") {
    return true;
  }
  return article.authorId === actor.id;
}

export function canEditArticleContent(actor: ActorContext | null | undefined, article: ArticleResource): boolean {
  if (!actor || actor.status !== "ACTIVE") return false;
  if (actor.role === "ADMIN") return true;
  if (actor.role === "WRITER" && article.authorId === actor.id) {
    return WRITER_EDITABLE_STATES.has(article.status);
  }
  return false;
}

export function canTransitionArticleState(
  actor: ActorContext | null | undefined,
  article: ArticleResource,
  targetStatus: ArticleState
): { allowed: boolean; reason?: string } {
  if (!actor || actor.status !== "ACTIVE") {
    return { allowed: false, reason: "Active authentication required." };
  }
  if (article.status === targetStatus) {
    return { allowed: true };
  }
  if (actor.role !== "ADMIN" && article.authorId !== actor.id) {
    return { allowed: false, reason: "Writers can only transition their own articles." };
  }

  const allowedRoles = VALID_TRANSITIONS[article.status]?.get(targetStatus);
  if (!allowedRoles || !allowedRoles.has(actor.role)) {
    return {
      allowed: false,
      reason: `Role ${actor.role} cannot transition article from ${article.status} to ${targetStatus}.`,
    };
  }
  return { allowed: true };
}

export function canModifyUserRoleOrStatus(
  actor: ActorContext,
  targetUserId: string,
  newRole: Role,
  newStatus: AccountStatusType,
  activeAdminCount: number
): { allowed: boolean; reason?: string } {
  if (actor.status !== "ACTIVE" || actor.role !== "ADMIN") {
    return { allowed: false, reason: "Only active administrators can modify user accounts." };
  }
  if (actor.id === targetUserId) {
    if (newRole !== "ADMIN") {
      return { allowed: false, reason: "Administrators cannot demote their own account (self-lockout protection)." };
    }
    if (newStatus !== "ACTIVE") {
      return { allowed: false, reason: "Administrators cannot suspend their own account." };
    }
  }
  if ((newRole !== "ADMIN" || newStatus !== "ACTIVE") && activeAdminCount <= 1) {
    return { allowed: false, reason: "Cannot remove or suspend the last active administrator." };
  }
  return { allowed: true };
}
