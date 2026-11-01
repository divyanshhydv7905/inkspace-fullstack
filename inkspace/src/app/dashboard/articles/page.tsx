import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function WriterArticlesPage() {
  const session = await auth();
  const articles = await prisma.article.findMany({
    where: { authorId: session!.user!.id! },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="font-serif-editorial text-3xl text-[#191919]">My Articles</h1>
      <div className="bg-white border border-[#E9E6E0] rounded overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#E9E6E0] bg-[#FAF9F6] text-xs uppercase text-[#77736E]">
            <tr>
              <th className="p-4">Headline</th>
              <th className="p-4">Status</th>
              <th className="p-4">Updated</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E9E6E0]">
            {articles.map((art) => (
              <tr key={art.id}>
                <td className="p-4 font-medium">{art.title}</td>
                <td className="p-4"><span className="px-2 py-1 text-xs rounded bg-[#FAF9F6] border border-[#E9E6E0]">{art.status}</span></td>
                <td className="p-4 text-xs text-[#77736E]">{new Date(art.updatedAt).toLocaleDateString()}</td>
                <td className="p-4">
                  <Link href={`/dashboard/articles/${art.id}/edit`} className="text-xs text-[#2D4A3E] underline">
                    Open Editor
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
