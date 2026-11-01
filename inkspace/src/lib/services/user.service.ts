import bcrypt from "bcryptjs";
import { prisma } from "../prisma";
import { RegisterSchema, ProfileUpdateSchema } from "../validations/auth.schema";
import { AdminUserMutationSchema } from "../validations/user.schema";
import { ActorContext, assertActiveAccount, canModifyUserRoleOrStatus } from "../permissions/policy";

export async function registerWriterAccount(rawInput: unknown) {
  const data = RegisterSchema.parse(rawInput);
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new Error("CONFLICT: An account with this email address already exists.");
  }

  const passwordHash = await bcrypt.hash(data.password, 12);
  // Public registration can NEVER create an ADMIN account
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      bio: data.bio ?? null,
      role: "WRITER",
      status: "ACTIVE",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });
}

export async function updateOwnProfile(actor: ActorContext, rawInput: unknown) {
  assertActiveAccount(actor);
  const data = ProfileUpdateSchema.parse(rawInput);
  return prisma.user.update({
    where: { id: actor.id },
    data: {
      name: data.name,
      bio: data.bio ?? null,
      avatarUrl: data.avatarUrl ?? null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      avatarUrl: true,
      role: true,
    },
  });
}

export async function adminUpdateUserAccount(actor: ActorContext, rawInput: unknown) {
  assertActiveAccount(actor);
  const data = AdminUserMutationSchema.parse(rawInput);

  const activeAdminCount = await prisma.user.count({
    where: { role: "ADMIN", status: "ACTIVE" },
  });

  const check = canModifyUserRoleOrStatus(
    actor,
    data.targetUserId,
    data.role,
    data.status,
    activeAdminCount
  );

  if (!check.allowed) {
    throw new Error(`FORBIDDEN: ${check.reason}`);
  }

  return prisma.$transaction(async (tx) => {
    const previous = await tx.user.findUnique({ where: { id: data.targetUserId } });
    if (!previous) {
      throw new Error("NOT_FOUND: Target user not found.");
    }

    const updated = await tx.user.update({
      where: { id: data.targetUserId },
      data: {
        role: data.role,
        status: data.status,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: actor.id,
        action: "USER_ROLE_OR_STATUS_UPDATED",
        targetResourceType: "User",
        targetResourceId: updated.id,
        metadata: {
          previousRole: previous.role,
          newRole: updated.role,
          previousStatus: previous.status,
          newStatus: updated.status,
          reason: data.reason,
        },
      },
    });

    return updated;
  });
}
