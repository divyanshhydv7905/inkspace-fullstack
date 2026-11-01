import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut} from "@/lib/auth";
import { canAccessAdminPanel } from "@/lib/permissions/policy";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const actor = session?.user?.id
    ? {
        id: session.user.id,
        role: ((session.user as { role?: string }).role ?? "READER") as "READER" | "WRITER" | "ADMIN",
        status: ((session.user as { status?: string }).status ?? "ACTIVE") as "ACTIVE" | "SUSPENDED",
      }
    : null;

  if (!canAccessAdminPanel(actor)) {
    redirect("/forbidden");
  }

  return (
    <div className="min-h-screen flex bg-[#FAF9F6]">
      <aside className="w-64 border-r border-[#E9E6E0] bg-[#191919] text-white p-6 hidden md:flex flex-col justify-between">
        <div className="space-y-6">
          <Link href="/admin" className="font-serif-editorial text-2xl block">InkSpace Admin</Link>
          <nav className="space-y-2 text-sm text-stone-300">
            <Link href="/admin" className="block px-3 py-2 rounded hover:bg-white/10">Overview</Link>
            <Link href="/admin/articles" className="block px-3 py-2 rounded hover:bg-white/10">Moderation Queue</Link>
            <Link href="/admin/users" className="block px-3 py-2 rounded hover:bg-white/10">User Governance</Link>
            <Link href="/admin/categories" className="block px-3 py-2 rounded hover:bg-white/10">Categories & Tags</Link>
            <Link href="/admin/ai-reviews" className="block px-3 py-2 rounded hover:bg-white/10">AI Reviews & Jobs</Link>
            <Link href="/admin/activity" className="block px-3 py-2 rounded hover:bg-white/10">Audit Log</Link>
            <Link href="/admin/settings" className="block px-3 py-2 rounded hover:bg-white/10">Platform Settings</Link>
          </nav>
        </div>
        <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }}>
  <button type="submit" className="text-xs text-stone-400 hover:text-white mt-4">
    Sign Out →
  </button>
</form>
      </aside>
      <main className="flex-1 p-6 md:p-10">{children}</main>
    </div>
  );
}
