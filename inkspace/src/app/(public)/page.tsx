import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

export const revalidate = 60;

export default async function HomePage() {
  const [featured, latestArticles, editorsPicks, categories] = await Promise.all([
    prisma.article.findFirst({
      where: { status: "PUBLISHED", isFeatured: true },
      orderBy: { publishedAt: "desc" },
      include: { author: true, category: true },
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 6,
      include: { author: true, category: true },
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED", isEditorsPick: true },
      orderBy: { viewCount: "desc" },
      take: 3,
      include: { author: true, category: true },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 space-y-20">
        {featured && (
          <section aria-labelledby="featured-heading" className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center border-b border-[#E9E6E0] pb-16">
            <div className="lg:col-span-7">
              {featured.coverImageUrl && (
                <img
                  src={featured.coverImageUrl}
                  alt={featured.coverImageAlt || featured.title}
                  className="w-full aspect-video object-cover rounded border border-[#E9E6E0]"
                />
              )}
            </div>
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.15em] text-[#2D4A3E] font-medium">
                <span>Featured Essay</span>
                {featured.category && <span>• {featured.category.name}</span>}
              </div>
              <h1 id="featured-heading" className="font-serif-editorial text-3xl md:text-4xl leading-tight text-[#191919]">
                <Link href={`/articles/${featured.slug}`} className="hover:underline">
                  {featured.title}
                </Link>
              </h1>
              {featured.excerpt && (
                <p className="text-[#77736E] leading-relaxed">{featured.excerpt}</p>
              )}
              <div className="text-xs text-[#77736E] pt-2">
                By <span className="text-[#191919] font-medium">{featured.author.name}</span> • {featured.readingTimeMinutes} min read
              </div>
            </div>
          </section>
        )}

        <section aria-labelledby="latest-heading" className="space-y-8">
          <div className="flex items-center justify-between border-b border-[#E9E6E0] pb-4">
            <h2 id="latest-heading" className="font-serif-editorial text-2xl text-[#191919]">Latest Dispatches</h2>
            <div className="flex gap-3 text-xs text-[#77736E]">
              {categories.map((cat) => (
                <Link key={cat.id} href={`/categories/${cat.slug}`} className="hover:text-[#191919]">
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestArticles.map((art) => (
              <article key={art.id} className="group flex flex-col justify-between border border-[#E9E6E0] bg-white rounded p-5">
                <div className="space-y-3">
                  {art.coverImageUrl && (
                    <img
                      src={art.coverImageUrl}
                      alt={art.coverImageAlt || art.title}
                      loading="lazy"
                      className="w-full aspect-[4/3] object-cover rounded mb-3"
                    />
                  )}
                  <p className="text-xs uppercase tracking-wider text-[#2D4A3E]">
                    {art.category?.name ?? "Editorial"}
                  </p>
                  <h3 className="font-serif-editorial text-xl text-[#191919] group-hover:underline">
                    <Link href={`/articles/${art.slug}`}>{art.title}</Link>
                  </h3>
                  <p className="text-sm text-[#77736E] line-clamp-3">{art.excerpt}</p>
                </div>
                <div className="pt-4 mt-4 border-t border-[#E9E6E0] text-xs text-[#77736E] flex justify-between">
                  <span>{art.author.name}</span>
                  <span>{art.readingTimeMinutes} min read</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {editorsPicks.length > 0 && (
          <section aria-labelledby="picks-heading" className="bg-white border border-[#E9E6E0] rounded p-8 space-y-6">
            <h2 id="picks-heading" className="font-serif-editorial text-2xl text-[#191919]">Editor&apos;s Picks</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {editorsPicks.map((pick) => (
                <div key={pick.id} className="space-y-2">
                  <Link href={`/articles/${pick.slug}`} className="font-serif-editorial text-lg text-[#191919] hover:underline block">
                    {pick.title}
                  </Link>
                  <p className="text-xs text-[#77736E]">By {pick.author.name} • {pick.viewCount} reads</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      <PublicFooter />
    </div>
  );
}
