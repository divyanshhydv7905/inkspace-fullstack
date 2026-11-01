import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req: NextRequest & { auth?: { user?: { id?: string; role?: string; status?: string } } | null }) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user;

  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      const loginUrl = new URL("/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (user.status === "SUSPENDED") {
      return NextResponse.redirect(new URL("/login?error=AccountSuspended", req.nextUrl.origin));
    }
  }

  if (pathname.startsWith("/admin")) {
    if (!user) {
      const loginUrl = new URL("/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (user.status !== "ACTIVE" || user.role !== "ADMIN") {
      return NextResponse.rewrite(new URL("/forbidden", req.nextUrl.origin), { status: 403 });
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
