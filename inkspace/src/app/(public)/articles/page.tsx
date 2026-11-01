import Link from "next/link";
import { listPublicArticles } from "@/lib/services/article.service";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default async function ArticlesIndexPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const { items, pagination } = await listPublicArticles(params);

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 space-y-10">
        <header className="border-b border-[#E9E6E0] pb-6">
          <h1 className="font-serif-editorial text-4xl text-[#191919]">The Archive</h1>
          <p className="text-[#77736E] mt-2">
            Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} published essays)
          </p>
        </header>
        {items.length === 0 ? (
          <div className="py-16 text-center bg-white border border-[#E9E6E0] rounded">
            <p className="font-serif-editorial text-2xl text-[#191919] mb-2">No published essays matched your filter.</p>
            <Link href="/articles" className="text-sm text-[#2D4A3E] underline">Reset filters</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {items.map((art) => (
              <article key={art.id} className="bg-white border border-[#E9E6E0] rounded p-5 flex flex-col justify-between">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wider text-[#2D4A3E]">{art.category?.name ?? "Essay"}</p>
                  <h2 className="font-serif-editorial text-xl text-[#191919]">
                    <Link href={`/articles/${art.slug}`} className="hover:underline">{art.title}</Link>
                  </h2>
                  <p className="text-sm text-[#77736E] line-clamp-3">{art.excerpt}</p>
                </div>
                <p className="text-xs text-[#77736E] pt-4 mt-4 border-t border-[#E9E6E0]">
                  {art.author.name} • {art.readingTimeMinutes} min read
                </p>
              </article>
            ))}
          </div>
        )}
      </main>
      <PublicFooter />
    </div>
  );
}
