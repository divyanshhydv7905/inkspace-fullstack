import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-red-800 mb-3">403 — Access Restricted</p>
      <h1 className="font-serif-editorial text-4xl text-[#191919] mb-4">
        Editorial Administrator Clearance Required
      </h1>
      <p className="text-[#77736E] max-w-md mb-8">
        Your account does not hold administrator privileges to access the moderation and governance console.
      </p>
      <div className="flex gap-4">
        <Link href="/dashboard" className="px-5 py-2.5 border border-[#E9E6E0] bg-white text-sm font-medium rounded">
          Writer Workspace
        </Link>
        <Link href="/" className="px-5 py-2.5 bg-[#2D4A3E] text-white text-sm font-medium rounded">
          Public Magazine
        </Link>
      </div>
    </main>
  );
}
