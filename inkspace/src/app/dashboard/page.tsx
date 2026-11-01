import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function WriterDashboardPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const [total, published, pending, changesRequested, viewsAgg] = await Promise.all([
    prisma.article.count({ where: { authorId: userId } }),
    prisma.article.count({ where: { authorId: userId, status: "PUBLISHED" } }),
    prisma.article.count({ where: { authorId: userId, status: "PENDING_REVIEW" } }),
    prisma.article.count({ where: { authorId: userId, status: "CHANGES_REQUESTED" } }),
    prisma.article.aggregate({ where: { authorId: userId }, _sum: { viewCount: true } }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-serif-editorial text-3xl text-[#191919]">Writer Overview</h1>
        <Link href="/dashboard/articles/new" className="px-4 py-2 bg-[#2D4A3E] text-white text-sm rounded">
          Compose Essay
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E9E6E0] rounded p-5">
          <p className="text-xs text-[#77736E]">Total Articles</p>
          <p className="text-2xl font-serif-editorial mt-1">{total}</p>
        </div>
        <div className="bg-white border border-[#E9E6E0] rounded p-5">
          <p className="text-xs text-[#77736E]">Published</p>
          <p className="text-2xl font-serif-editorial mt-1">{published}</p>
        </div>
        <div className="bg-white border border-[#E9E6E0] rounded p-5">
          <p className="text-xs text-[#77736E]">Pending Review / Revision</p>
          <p className="text-2xl font-serif-editorial mt-1">{pending + changesRequested}</p>
        </div>
        <div className="bg-white border border-[#E9E6E0] rounded p-5">
          <p className="text-xs text-[#77736E]">Total Article Views</p>
          <p className="text-2xl font-serif-editorial mt-1">{viewsAgg._sum.viewCount ?? 0}</p>
        </div>
      </div>
    </div>
  );
}
