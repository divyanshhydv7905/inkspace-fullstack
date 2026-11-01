import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { saveArticleDraft } from "@/lib/services/article.service";
import type { ActorContext } from "@/lib/permissions/policy";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const { id } = await params;
    const actor: ActorContext = {
      id: session.user.id,
      role: ((session.user as { role?: string }).role ?? "WRITER") as ActorContext["role"],
      status: ((session.user as { status?: string }).status ?? "ACTIVE") as ActorContext["status"],
    };
    const body = await req.json();
    const updated = await saveArticleDraft(actor, body, id);
    return NextResponse.json({ article: updated, savedAt: updated.updatedAt }, { status: 200 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Update failed";
    const status = msg.startsWith("FORBIDDEN")
      ? 403
      : msg.startsWith("NOT_FOUND")
      ? 404
      : msg.startsWith("CONFLICT") || msg.startsWith("SLUG_COLLISION")
      ? 409
      : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
