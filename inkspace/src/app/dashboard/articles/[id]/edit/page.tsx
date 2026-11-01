import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TiptapEditorialEditor } from "@/components/editor/TiptapEditorialEditor";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const article = await prisma.article.findUnique({ where: { id } });

  if (!article || (article.authorId !== session?.user?.id && (session?.user as { role?: string })?.role !== "ADMIN")) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="font-serif-editorial text-3xl text-[#191919]">Edit Draft: {article.title}</h1>
      <TiptapEditorialEditor
        articleId={article.id}
        initialTitle={article.title}
        initialSubtitle={article.subtitle ?? ""}
        initialSlug={article.slug}
        initialExcerpt={article.excerpt ?? ""}
        initialHtml={article.contentHtml}
        initialStatus={article.status}
      />
    </div>
  );
}