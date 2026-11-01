import { isAIConfigured } from "@/lib/env";

export default function AIAssistantPage() {
  const configured = isAIConfigured();
  return (
    <div className="space-y-6">
      <h1 className="font-serif-editorial text-3xl text-[#191919]">AI Editorial Copilot & SEO Studio</h1>
      <div className="bg-white border border-[#E9E6E0] rounded p-6 space-y-3">
        <p className="text-sm font-medium">
          Anthropic Claude Status: {configured ? "Connected & Active" : "API Key Required (ANTHROPIC_API_KEY)"}
        </p>
        <p className="text-xs text-[#77736E]">
          All AI suggestions are validated with Zod schemas and require explicit writer review before insertion.
        </p>
      </div>
    </div>
  );
}
