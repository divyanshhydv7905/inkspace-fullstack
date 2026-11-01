import Link from "next/link";

export function PublicHeader() {
  return (
    <header className="border-b border-[#E9E6E0] bg-[#FAF9F6]/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="font-serif-editorial text-2xl tracking-tight text-[#191919] font-semibold">
          InkSpace
        </Link>
        <nav aria-label="Primary Editorial Navigation" className="hidden md:flex items-center gap-8 text-sm text-[#77736E]">
          <Link href="/articles" className="hover:text-[#191919] transition">All Essays</Link>
          <Link href="/categories/architecture-space" className="hover:text-[#191919] transition">Architecture</Link>
          <Link href="/categories/artificial-intelligence" className="hover:text-[#191919] transition">AI & Systems</Link>
          <Link href="/categories/typography-craft" className="hover:text-[#191919] transition">Typography</Link>
          <Link href="/search" className="hover:text-[#191919] transition">Search</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-sm px-4 py-2 border border-[#E9E6E0] bg-white rounded hover:border-[#191919] transition"
          >
            Writer Desk
          </Link>
          <Link
            href="/admin"
            className="text-sm px-4 py-2 bg-[#2D4A3E] text-white rounded hover:bg-[#233B31] transition"
          >
            Editorial Admin
          </Link>
        </div>
      </div>
    </header>
  );
}
