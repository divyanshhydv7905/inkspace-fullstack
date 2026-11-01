import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminModerationQueuePage() {
  const articles = await prisma.article.findMany({
    orderBy: [{ submittedAt: "desc" }, { updatedAt: "desc" }],
    include: { author: true, category: true, aiReviews: { take: 1, orderBy: { createdAt: "desc" } } },
  });

  return (
    <div className="space-y-6">
      <h1 className="font-serif-editorial text-3xl text-[#191919]">Article Review Queue</h1>
      <div className="bg-white border border-[#E9E6E0] rounded overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#FAF9F6] border-b border-[#E9E6E0] text-xs uppercase text-[#77736E]">
            <tr>
              <th className="p-4">Article</th>
              <th className="p-4">Author</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E9E6E0]">
            {articles.map((art) => (
              <tr key={art.id}>
                <td className="p-4 font-medium">{art.title}</td>
                <td className="p-4 text-[#77736E]">{art.author.name}</td>
                <td className="p-4"><span className="px-2 py-1 text-xs border border-[#E9E6E0] rounded">{art.status}</span></td>
                <td className="p-4">
                  <Link href={`/admin/articles/${art.id}`} className="text-xs text-[#2D4A3E] underline">
                    Inspect & Moderate
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
