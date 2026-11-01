import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { adminUpdateUserAccount } from "@/lib/services/user.service";
import type { ActorContext } from "@/lib/permissions/policy";

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const actor: ActorContext = {
      id: session.user.id,
      role: ((session.user as { role?: string }).role ?? "READER") as ActorContext["role"],
      status: ((session.user as { status?: string }).status ?? "ACTIVE") as ActorContext["status"],
    };
    if (actor.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Administrator role required" }, { status: 403 });
    }
    const body = await req.json();
    const updated = await adminUpdateUserAccount(actor, body);
    return NextResponse.json({ user: updated }, { status: 200 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "User update failed";
    const status = msg.startsWith("FORBIDDEN") ? 403 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
