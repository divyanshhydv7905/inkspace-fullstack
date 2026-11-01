import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listPublicArticles, saveArticleDraft } from "@/lib/services/article.service";
import type { ActorContext } from "@/lib/permissions/policy";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = Object.fromEntries(searchParams.entries());
    const result = await listPublicArticles(query);
    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Invalid search parameters" }, { status: 400 });
  }
}

export async function POST(req: Request) {
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
    const body = await req.json();
    const created = await saveArticleDraft(actor, body);
    return NextResponse.json({ article: created }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to save draft";
    const status = msg.startsWith("FORBIDDEN") ? 403 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
