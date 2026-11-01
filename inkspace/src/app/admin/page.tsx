import { prisma } from "@/lib/prisma";

export default async function AdminOverviewPage() {
  const [totalArticles, published, pendingReview, drafts, totalUsers, viewsAgg] = await Promise.all([
    prisma.article.count(),
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.article.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.article.count({ where: { status: "DRAFT" } }),
    prisma.user.count(),
    prisma.article.aggregate({ _sum: { viewCount: true } }),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="font-serif-editorial text-3xl text-[#191919]">Editorial Governance Overview</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white border border-[#E9E6E0] rounded p-4"><p className="text-xs text-[#77736E]">Total Articles</p><p className="text-2xl font-serif-editorial">{totalArticles}</p></div>
        <div className="bg-white border border-[#E9E6E0] rounded p-4"><p className="text-xs text-[#77736E]">Published</p><p className="text-2xl font-serif-editorial">{published}</p></div>
        <div className="bg-white border border-[#E9E6E0] rounded p-4"><p className="text-xs text-[#77736E]">Pending Review</p><p className="text-2xl font-serif-editorial">{pendingReview}</p></div>
        <div className="bg-white border border-[#E9E6E0] rounded p-4"><p className="text-xs text-[#77736E]">Drafts</p><p className="text-2xl font-serif-editorial">{drafts}</p></div>
        <div className="bg-white border border-[#E9E6E0] rounded p-4"><p className="text-xs text-[#77736E]">Registered Users</p><p className="text-2xl font-serif-editorial">{totalUsers}</p></div>
        <div className="bg-white border border-[#E9E6E0] rounded p-4"><p className="text-xs text-[#77736E]">Total Reads</p><p className="text-2xl font-serif-editorial">{viewsAgg._sum.viewCount ?? 0}</p></div>
      </div>
    </div>
  );
}
