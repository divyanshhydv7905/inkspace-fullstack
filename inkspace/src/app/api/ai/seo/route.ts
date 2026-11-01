import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAIConfigured } from "@/lib/env";
import { runSEOAssistant } from "@/lib/services/ai.service";
import type { ActorContext } from "@/lib/permissions/policy";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (!isAIConfigured()) {
      return NextResponse.json(
        {
          error: "AI_NOT_CONFIGURED",
          message: "Anthropic Claude API is not configured. Set ANTHROPIC_API_KEY in .env to enable AI SEO Assistant.",
        },
        { status: 503 }
      );
    }
    const actor: ActorContext = {
      id: session.user.id,
      role: ((session.user as { role?: string }).role ?? "WRITER") as ActorContext["role"],
      status: ((session.user as { status?: string }).status ?? "ACTIVE") as ActorContext["status"],
    };
    const body = await req.json();
    const result = await runSEOAssistant(actor, String(body.title ?? ""), String(body.articleBody ?? ""));
    return NextResponse.json({ result }, { status: 200 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "AI SEO error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
