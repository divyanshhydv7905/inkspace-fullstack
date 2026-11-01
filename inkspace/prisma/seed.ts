import { PrismaClient, ArticleStatus, UserRole, AccountStatus, ReviewDecision, AIReviewType, AIJobStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding InkSpace database with fictional demonstration data...");

  // 1. Site Settings
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      siteName: "InkSpace",
      siteDescription: "A minimalist editorial journal for architecture, artificial intelligence, design systems, and modern culture.",
      defaultSeoTitle: "InkSpace — Modern Editorial Publishing",
      defaultSeoDescription: "Long-form essays, design criticism, and engineering narratives.",
      aiEnabled: true,
      aiAutoModerationOnSubmit: true,
      aiModelIdentifier: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
      requireTwoStepPublish: true,
    },
  });

  // 2. Categories
  const categoriesData = [
    { name: "Architecture & Space", slug: "architecture-space", description: "Materiality, civic spaces, and quiet architectural permanence." },
    { name: "Artificial Intelligence", slug: "artificial-intelligence", description: "Bounded agency, human-in-the-loop systems, and applied machine intelligence." },
    { name: "Typography & Craft", slug: "typography-craft", description: "Editorial grid systems, optical kerning, and print-inspired digital interfaces." },
    { name: "Digital Culture", slug: "digital-culture", description: "Slow media, attention ecology, and the future of independent publishing." },
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description },
      create: cat,
    });
    categories[cat.slug] = created.id;
  }

  // 3. Tags
  const tagsList = [
    { name: "Editorial Design", slug: "editorial-design" },
    { name: "Agentic Workflows", slug: "agentic-workflows" },
    { name: "Minimalism", slug: "minimalism" },
    { name: "Design Systems", slug: "design-systems" },
    { name: "Slow Media", slug: "slow-media" },
    { name: "Typography", slug: "typography" },
  ];

  const tags: Record<string, string> = {};
  for (const t of tagsList) {
    const created = await prisma.tag.upsert({
      where: { slug: t.slug },
      update: { name: t.name },
      create: t,
    });
    tags[t.slug] = created.id;
  }

  // 4. Demo Writers (Non-admin accounts; Admin must be created via scripts/bootstrap-admin.ts)
  const demoPasswordHash = await bcrypt.hash("WriterDemoPass!2026", 12);

  const clara = await prisma.user.upsert({
    where: { email: "clara.vance@inkspace.editorial" },
    update: {},
    create: {
      name: "Clara Vance",
      email: "clara.vance@inkspace.editorial",
      passwordHash: demoPasswordHash,
      role: UserRole.WRITER,
      status: AccountStatus.ACTIVE,
      bio: "Senior architectural critic and essayist exploring tactile minimalism in digital and physical spaces.",
    },
  });

  const julian = await prisma.user.upsert({
    where: { email: "julian.mercer@inkspace.editorial" },
    update: {},
    create: {
      name: "Julian Mercer",
      email: "julian.mercer@inkspace.editorial",
      passwordHash: demoPasswordHash,
      role: UserRole.WRITER,
      status: AccountStatus.ACTIVE,
      bio: "Systems architect writing on bounded AI workflows, verification, and calm software.",
    },
  });

  // 5. Articles (Clearly marked isSeedData: true)
  const articlesData = [
    {
      title: "The Architecture of Quiet Interfaces: Why Digital Publishing Needs Spatial Restraint",
      subtitle: "Lessons from physical printmaking, Nordic courtyards, and Swiss typographic grids for modern web applications.",
      slug: "architecture-of-quiet-interfaces",
      excerpt: "Modern software often confuses density with utility. By returning to classical editorial proportions, generous margins, and warm paper tones, digital reading environments can restore cognitive calm.",
      authorId: clara.id,
      categoryId: categories["architecture-space"]!,
      status: ArticleStatus.PUBLISHED,
      isFeatured: true,
      isEditorsPick: true,
      isSeedData: true,
      readingTimeMinutes: 6,
      viewCount: 1420,
      coverImageUrl: "/images/cover-hero-desk.jpg",
      coverImageAlt: "Sunlit wooden desk with an open linen notebook and fountain pen in a minimalist studio",
      seoTitle: "The Architecture of Quiet Interfaces | InkSpace Editorial",
      seoDescription: "How spatial restraint, Swiss grids, and tactile typography transform digital reading.",
      primaryKeyword: "quiet interfaces editorial design",
      publishedAt: new Date("2026-10-18T09:00:00Z"),
      submittedAt: new Date("2026-10-17T14:00:00Z"),
      approvedAt: new Date("2026-10-18T08:30:00Z"),
      contentJson: {
        type: "doc",
        content: [
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "I. Margin as Cognitive Breathing Room" }] },
          { type: "paragraph", content: [{ type: "text", text: "When Jan Tschichold codified the canons of book page construction in the mid-twentieth century, margins were never treated as wasted paper. They were structural acoustic dampeners—separating the reader's immediate focus from the noise of the surrounding world." }] },
          { type: "blockquote", content: [{ type: "paragraph", content: [{ type: "text", text: "Good typography does not shout for attention; it constructs an unhurried room where complex thought can unfold without friction." }] }] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "II. Tactile Honesty in Screen Media" }] },
          { type: "paragraph", content: [{ type: "text", text: "Stark #000000 text on #FFFFFF backlights creates halation and visual fatigue. Shifting the canvas to warm ivory (#FAF9F6) with charcoal ink (#191919) mimics cotton rag paper under diffused daylight." }] }
        ]
      },
      contentHtml: "<h2>I. Margin as Cognitive Breathing Room</h2><p>When Jan Tschichold codified the canons of book page construction in the mid-twentieth century, margins were never treated as wasted paper. They were structural acoustic dampeners—separating the reader's immediate focus from the noise of the surrounding world.</p><blockquote><p>Good typography does not shout for attention; it constructs an unhurried room where complex thought can unfold without friction.</p></blockquote><h2>II. Tactile Honesty in Screen Media</h2><p>Stark #000000 text on #FFFFFF backlights creates halation and visual fatigue. Shifting the canvas to warm ivory (#FAF9F6) with charcoal ink (#191919) mimics cotton rag paper under diffused daylight.</p>"
    },
    {
      title: "Bounded Agency: Designing Human-in-the-Loop AI for Editorial Newsrooms",
      subtitle: "Why the most effective AI systems act as disciplined research instruments rather than autonomous publishers.",
      slug: "bounded-agency-human-in-the-loop-ai",
      excerpt: "Autonomous content generation degrades trust. Here is how structured schema validation, advisory-only moderation, and explicit editor approval preserve human voice.",
      authorId: julian.id,
      categoryId: categories["artificial-intelligence"]!,
      status: ArticleStatus.PUBLISHED,
      isFeatured: false,
      isEditorsPick: true,
      isSeedData: true,
      readingTimeMinutes: 8,
      viewCount: 980,
      coverImageUrl: "/images/cover-tech-objects.jpg",
      coverImageAlt: "Geometric brushed brass and matte ceramic forms on travertine stone",
      seoTitle: "Bounded Agency: Human-in-the-Loop AI for Newsrooms | InkSpace",
      seoDescription: "Architectural patterns for safe, schema-validated AI assistance in editorial publishing.",
      primaryKeyword: "human in the loop editorial AI",
      publishedAt: new Date("2026-10-20T11:30:00Z"),
      submittedAt: new Date("2026-10-19T16:00:00Z"),
      approvedAt: new Date("2026-10-20T10:00:00Z"),
      contentJson: {
        type: "doc",
        content: [
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "The Fallacy of Autonomous Publishing" }] },
          { type: "paragraph", content: [{ type: "text", text: "In high-trust publishing, every sentence carries institutional accountability. Allowing a language model to mutate production records or publish directly bypasses editorial judgment." }] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Schema-Validated Advisory Pipelines" }] },
          { type: "paragraph", content: [{ type: "text", text: "By constraining model outputs through strict Zod schemas and isolating article text inside untrusted data delimiters, engineering teams can surface structural critiques and SEO metadata safely." }] }
        ]
      },
      contentHtml: "<h2>The Fallacy of Autonomous Publishing</h2><p>In high-trust publishing, every sentence carries institutional accountability. Allowing a language model to mutate production records or publish directly bypasses editorial judgment.</p><h2>Schema-Validated Advisory Pipelines</h2><p>By constraining model outputs through strict Zod schemas and isolating article text inside untrusted data delimiters, engineering teams can surface structural critiques and SEO metadata safely.</p>"
    },
    {
      title: "Movable Type to Variable Fonts: Optical Sizing in Long-Form Journalism",
      subtitle: "How modern variable serifs revive the micro-adjustments of sixteenth-century punchcutters.",
      slug: "movable-type-to-variable-fonts-optical-sizing",
      excerpt: "Punchcutters once carved distinct optical masters for every point size. Variable font axes now bring that lost subtlety back to responsive browsers.",
      authorId: clara.id,
      categoryId: categories["typography-craft"]!,
      status: ArticleStatus.PENDING_REVIEW,
      isFeatured: false,
      isEditorsPick: false,
      isSeedData: true,
      readingTimeMinutes: 5,
      viewCount: 0,
      coverImageUrl: "/images/cover-typography-press.jpg",
      coverImageAlt: "Metal movable type blocks and cotton paper sheets on a wooden printmaker workbench",
      seoTitle: "Optical Sizing in Long-Form Journalism | InkSpace",
      seoDescription: "Exploring optical size axes from metal type punchcutting to modern variable web fonts.",
      primaryKeyword: "optical sizing variable fonts",
      submittedAt: new Date("2026-10-22T08:15:00Z"),
      contentJson: {
        type: "doc",
        content: [
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "The Loss of Optical Masters" }] },
          { type: "paragraph", content: [{ type: "text", text: "When phototypesetting and early digital outlines replaced foundry metal, a single vector master was scaled linearly from 8pt captions to 72pt display headlines." }] }
        ]
      },
      contentHtml: "<h2>The Loss of Optical Masters</h2><p>When phototypesetting and early digital outlines replaced foundry metal, a single vector master was scaled linearly from 8pt captions to 72pt display headlines.</p>"
    }
  ];

  for (const art of articlesData) {
    const upserted = await prisma.article.upsert({
      where: { slug: art.slug },
      update: {},
      create: art,
    });

    await prisma.articleRevision.upsert({
      where: {
        articleId_versionNumber: {
          articleId: upserted.id,
          versionNumber: 1,
        },
      },
      update: {},
      create: {
        articleId: upserted.id,
        authorId: art.authorId,
        versionNumber: 1,
        title: art.title,
        subtitle: art.subtitle,
        excerpt: art.excerpt,
        contentJson: art.contentJson,
        changeSummary: "Initial seeded revision (fictional demonstration content)",
      },
    });
  }

  console.log("Seed complete. Run `npm run admin:bootstrap` with INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD to provision an administrator.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
