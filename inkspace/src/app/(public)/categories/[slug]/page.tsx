import { listPublicArticles } from "@/lib/services/article.service";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import Link from "next/link";

export default async function CategoryListingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { items } = await listPublicArticles({ category: slug });

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 space-y-8">
        <h1 className="font-serif-editorial text-3xl text-[#191919] capitalize">
          Section: {slug.replace(/-/g, " ")}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((art) => (
            <article key={art.id} className="bg-white border border-[#E9E6E0] rounded p-5 space-y-3">
              <h2 className="font-serif-editorial text-xl">
                <Link href={`/articles/${art.slug}`} className="hover:underline">{art.title}</Link>
              </h2>
              <p className="text-sm text-[#77736E]">{art.excerpt}</p>
            </article>
          ))}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
