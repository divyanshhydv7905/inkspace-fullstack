import { NextResponse } from "next/server";
import { registerWriterAccount } from "@/lib/services/user.service";
import { checkRateLimit } from "@/lib/utils/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "local";
    const rate = checkRateLimit(`register:${ip}`, 5, 60_000);
    if (!rate.allowed) {
      return NextResponse.json({ error: "Rate limit exceeded. Try again shortly." }, { status: 429 });
    }

    const contentType = req.headers.get("content-type") || "";
    const isFormData = !contentType.includes("application/json");
    const body = isFormData
      ? Object.fromEntries((await req.formData()).entries())
      : await req.json();

    const user = await registerWriterAccount(body);

    // Agar HTML form submit hua hai toh direct login page par bhej dega
    if (isFormData) {
      return NextResponse.redirect(new URL("/login?registered=true", req.url), 303);
    }

    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Registration failed";
    const status = msg.startsWith("CONFLICT") ? 409 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}