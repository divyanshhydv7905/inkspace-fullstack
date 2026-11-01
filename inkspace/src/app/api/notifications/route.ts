import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listUserNotifications, markNotificationRead } from "@/lib/services/notification.service";
import type { ActorContext } from "@/lib/permissions/policy";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const actor: ActorContext = {
      id: session.user.id,
      role: ((session.user as { role?: string }).role ?? "WRITER") as ActorContext["role"],
      status: ((session.user as { status?: string }).status ?? "ACTIVE") as ActorContext["status"],
    };
    const data = await listUserNotifications(actor);
    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to load notifications" }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const actor: ActorContext = {
      id: session.user.id,
      role: ((session.user as { role?: string }).role ?? "WRITER") as ActorContext["role"],
      status: ((session.user as { status?: string }).status ?? "ACTIVE") as ActorContext["status"],
    };
    const { notificationId } = await req.json();
    const updated = await markNotificationRead(actor, String(notificationId));
    return NextResponse.json({ notification: updated }, { status: 200 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: msg }, { status: 403 });
  }
}
