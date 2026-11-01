import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { NewsletterSubscribeSchema } from "@/lib/validations/user.schema";
import { checkRateLimit } from "@/lib/utils/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "local";
    const rate = checkRateLimit(`newsletter:${ip}`, 5, 60_000);
    if (!rate.allowed) {
      return NextResponse.json({ error: "Too many attempts. Please wait a moment." }, { status: 429 });
    }
    const body = await req.json();
    const parsed = NewsletterSubscribeSchema.parse(body);

    const subscription = await prisma.newsletterSubscription.upsert({
      where: { email: parsed.email },
      update: {
        consentGiven: true,
        consentTimestamp: new Date(),
        unsubscribedAt: null,
      },
      create: {
        email: parsed.email,
        consentGiven: true,
      },
    });

    return NextResponse.json(
      {
        subscribed: true,
        email: subscription.email,
        deliveryMode: "database_recorded_no_external_smtp_configured",
        message: "Your subscription preference has been recorded in the InkSpace ledger.",
      },
      { status: 200 }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid newsletter request";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
