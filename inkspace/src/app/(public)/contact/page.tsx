import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1 max-w-2xl mx-auto px-6 py-14 space-y-6">
        <h1 className="font-serif-editorial text-4xl text-[#191919]">Contact the Editorial Desk</h1>
        <p className="text-[#77736E]">
          For essay pitches, syndication inquiries, or security disclosures, reach our editors at <span className="text-[#191919] font-medium">editors@inkspace.editorial</span>.
        </p>
      </main>
      <PublicFooter />
    </div>
  );
}
