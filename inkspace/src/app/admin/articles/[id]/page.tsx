import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminReviewActions } from "@/components/admin/AdminReviewActions";

export default async function AdminArticleReviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      author: true,
      category: true,
      reviews: { include: { reviewer: true }, orderBy: { createdAt: "desc" } },
      aiReviews: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!article) notFound();

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-center justify-between border-b border-[#E9E6E0] pb-4">
        <div>
          <Link href="/admin/articles" className="text-xs text-[#2D4A3E] underline block mb-1">
            ← Back to Review Queue
          </Link>
          <h1 className="font-serif-editorial text-3xl text-[#191919]">{article.title}</h1>
          <p className="text-xs text-[#77736E] mt-1">
            By <strong className="text-[#191919]">{article.author.name}</strong> ({article.author.email}) •{" "}
            Updated {new Date(article.updatedAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Review & Publish Buttons */}
      <AdminReviewActions
        articleId={article.id}
        currentStatus={article.status}
        slug={article.slug}
        title={article.title}
      />

      {/* Article Content Preview */}
      <div className="bg-white border border-[#E9E6E0] rounded-lg p-8 md:p-12 space-y-6">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#77736E]">Article Preview</span>
          <h2 className="font-serif-editorial text-3xl text-[#191919] mt-2">{article.title}</h2>
          {article.subtitle && <p className="text-lg text-[#77736E] mt-2 font-serif-editorial">{article.subtitle}</p>}
          {article.excerpt && <p className="text-sm text-[#77736E] mt-3 italic border-l-2 border-[#2D4A3E] pl-3">{article.excerpt}</p>}
        </div>
        <hr className="border-[#E9E6E0]" />
        <div className="prose max-w-none text-[#191919] leading-relaxed" dangerouslySetInnerHTML={{ __html: article.contentHtml }} />
      </div>
    </div>
  );
}