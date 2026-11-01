import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1 max-w-3xl mx-auto px-6 py-14 space-y-8">
        <h1 className="font-serif-editorial text-4xl text-[#191919]">About InkSpace</h1>
        <p className="text-[#77736E] leading-relaxed">
          InkSpace is a minimalist digital magazine and editorial workflow platform built around typographic clarity, human-in-the-loop AI assistance, and rigorous editorial governance.
        </p>
        <section id="privacy" className="pt-6 border-t border-[#E9E6E0] space-y-2">
          <h2 className="font-serif-editorial text-2xl text-[#191919]">Privacy Policy</h2>
          <p className="text-sm text-[#77736E]">
            We store only essential account, draft revision, and newsletter consent records. Article content sent to the Anthropic API is isolated and never used to grant autonomous permissions.
          </p>
        </section>
        <section id="terms" className="pt-6 border-t border-[#E9E6E0] space-y-2">
          <h2 className="font-serif-editorial text-2xl text-[#191919]">Terms of Publication</h2>
          <p className="text-sm text-[#77736E]">
            Writers retain copyright over their essays while granting InkSpace non-exclusive publication rights once approved and published by an editorial administrator.
          </p>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
