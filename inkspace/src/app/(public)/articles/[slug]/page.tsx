import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublicArticleBySlug } from "@/lib/services/article.service";
import { sanitizeEditorialHtml } from "@/lib/utils/sanitize";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublicArticleBySlug(slug);
  if (!article) {
    return { title: "Article Not Found" };
  }
  const canonicalUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/articles/${article.slug}`;
  return {
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt || undefined,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "article",
      title: article.seoTitle || article.title,
      description: article.seoDescription || article.excerpt || undefined,
      url: canonicalUrl,
      publishedTime: article.publishedAt?.toISOString(),
    },
  };
}

export default async function ArticleReadingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getPublicArticleBySlug(slug);
  if (!article) {
    notFound();
  }

  const safeHtml = sanitizeEditorialHtml(article.contentHtml);

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <article className="flex-1 max-w-3xl mx-auto px-6 py-14 space-y-8">
        <header className="space-y-4 border-b border-[#E9E6E0] pb-8">
          <div className="text-xs uppercase tracking-[0.15em] text-[#2D4A3E] font-medium">
            {article.category?.name ?? "Editorial"} • {article.readingTimeMinutes} min read
          </div>
          <h1 className="font-serif-editorial text-4xl md:text-5xl leading-tight text-[#191919]">
            {article.title}
          </h1>
          {article.subtitle && (
            <p className="text-xl text-[#77736E] leading-relaxed">{article.subtitle}</p>
          )}
          <div className="text-sm text-[#77736E] pt-2">
            By <span className="text-[#191919] font-medium">{article.author.name}</span>
            {article.publishedAt && ` • Published ${new Date(article.publishedAt).toLocaleDateString()}`}
          </div>
        </header>

        {article.coverImageUrl && (
          <figure className="space-y-2">
            <img
              src={article.coverImageUrl}
              alt={article.coverImageAlt || article.title}
              className="w-full rounded border border-[#E9E6E0]"
            />
            {article.coverImageAlt && (
              <figcaption className="text-xs text-[#77736E] italic">{article.coverImageAlt}</figcaption>
            )}
          </figure>
        )}

        <div
          className="prose prose-lg max-w-none text-[#191919] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
      </article>
      <PublicFooter />
    </div>
  );
}
