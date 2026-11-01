import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="border-t border-[#E9E6E0] bg-[#FAF9F6] mt-24 py-16">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10 text-sm">
        <div className="md:col-span-2">
          <p className="font-serif-editorial text-xl text-[#191919] mb-3">InkSpace</p>
          <p className="text-[#77736E] max-w-sm leading-relaxed">
            An independent digital publication dedicated to calm technology, architectural permanence, and human-in-the-loop editorial craft.
          </p>
        </div>
        <div>
          <p className="font-medium text-[#191919] mb-3 uppercase tracking-wider text-xs">Sections</p>
          <ul className="space-y-2 text-[#77736E]">
            <li><Link href="/articles" className="hover:text-[#191919]">Latest Essays</Link></li>
            <li><Link href="/categories/architecture-space" className="hover:text-[#191919]">Architecture & Space</Link></li>
            <li><Link href="/categories/artificial-intelligence" className="hover:text-[#191919]">Artificial Intelligence</Link></li>
            <li><Link href="/categories/typography-craft" className="hover:text-[#191919]">Typography & Craft</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-medium text-[#191919] mb-3 uppercase tracking-wider text-xs">Masthead & Legal</p>
          <ul className="space-y-2 text-[#77736E]">
            <li><Link href="/about" className="hover:text-[#191919]">About InkSpace</Link></li>
            <li><Link href="/contact" className="hover:text-[#191919]">Contact the Editors</Link></li>
            <li><Link href="/about#privacy" className="hover:text-[#191919]">Privacy Policy</Link></li>
            <li><Link href="/about#terms" className="hover:text-[#191919]">Terms of Publication</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
