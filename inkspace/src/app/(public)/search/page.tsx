import { listPublicArticles } from "@/lib/services/article.service";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import Link from "next/link";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const { items, pagination } = await listPublicArticles(params);

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1 max-w-5xl mx-auto px-6 py-12 space-y-8">
        <h1 className="font-serif-editorial text-3xl text-[#191919]">Search the Archive</h1>
        <form action="/search" method="GET" className="flex gap-3">
          <input
            type="search"
            name="q"
            defaultValue={params.q || ""}
            placeholder="Search by headline, concept, or body text..."
            className="flex-1 px-4 py-2.5 bg-white border border-[#E9E6E0] rounded text-sm"
          />
          <button type="submit" className="px-6 py-2.5 bg-[#2D4A3E] text-white text-sm font-medium rounded">
            Search
          </button>
        </form>
        <p className="text-xs text-[#77736E]">Found {pagination.total} published results</p>
        <div className="space-y-4">
          {items.map((art) => (
            <article key={art.id} className="bg-white border border-[#E9E6E0] rounded p-5">
              <h2 className="font-serif-editorial text-xl text-[#191919]">
                <Link href={`/articles/${art.slug}`} className="hover:underline">{art.title}</Link>
              </h2>
              <p className="text-sm text-[#77736E] mt-1">{art.excerpt}</p>
            </article>
          ))}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
