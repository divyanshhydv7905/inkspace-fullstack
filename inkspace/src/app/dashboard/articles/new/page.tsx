import { TiptapEditorialEditor } from "@/components/editor/TiptapEditorialEditor";

export default function NewArticlePage() {
  return (
    <div className="space-y-6">
      <h1 className="font-serif-editorial text-3xl text-[#191919]">Compose New Essay</h1>
      <TiptapEditorialEditor />
    </div>
  );
}
