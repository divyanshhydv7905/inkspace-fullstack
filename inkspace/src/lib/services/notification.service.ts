import { prisma } from "../prisma";
import { ActorContext, assertActiveAccount } from "../permissions/policy";

export async function listUserNotifications(actor: ActorContext) {
  assertActiveAccount(actor);
  const [items, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { recipientId: actor.id },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.notification.count({
      where: { recipientId: actor.id, isRead: false },
    }),
  ]);
  return { items, unreadCount };
}

export async function markNotificationRead(actor: ActorContext, notificationId: string) {
  assertActiveAccount(actor);
  const notif = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!notif || notif.recipientId !== actor.id) {
    throw new Error("FORBIDDEN: Cannot modify another user's notification.");
  }
  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}
