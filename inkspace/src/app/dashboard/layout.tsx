import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  return (
    <div className="min-h-screen flex bg-[#FAF9F6]">
      <aside className="w-64 border-r border-[#E9E6E0] bg-white p-6 hidden md:flex flex-col justify-between">
        <div className="space-y-6">
          <Link
            href="/"
            className="font-serif-editorial text-2xl text-[#191919] block"
          >
            InkSpace
          </Link>
          <p className="text-xs uppercase tracking-wider text-[#77736E]">
            Writer Workspace
          </p>
          <nav className="space-y-2 text-sm">
            <Link
              href="/dashboard"
              className="block px-3 py-2 rounded hover:bg-[#FAF9F6]"
            >
              Overview
            </Link>
            <Link
              href="/dashboard/articles"
              className="block px-3 py-2 rounded hover:bg-[#FAF9F6]"
            >
              My Articles
            </Link>
            <Link
              href="/dashboard/articles/new"
              className="block px-3 py-2 rounded hover:bg-[#FAF9F6]"
            >
              New Draft
            </Link>
            <Link
              href="/dashboard/ai-assistant"
              className="block px-3 py-2 rounded hover:bg-[#FAF9F6]"
            >
              AI Writing Studio
            </Link>
            <Link
              href="/dashboard/settings"
              className="block px-3 py-2 rounded hover:bg-[#FAF9F6]"
            >
              Profile Settings
            </Link>
          </nav>
        </div>
        <div className="text-xs text-[#77736E] border-t border-[#E9E6E0] pt-4">
          Signed in as{" "}
          <span className="text-[#191919] font-medium block">
            {session.user.name || session.user.email}
          </span>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            className="text-xs text-rose-600 hover:underline font-medium mt-2"
          >
            Sign Out →
          </button>
        </form>
      </aside>
      <main className="flex-1 p-6 md:p-10">{children}</main>
    </div>
  );
}
