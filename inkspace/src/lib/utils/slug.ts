export function generateSlug(input: string): string {
  const normalized = input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const truncated = normalized.slice(0, 96).replace(/-+$/g, "");
  return truncated || "untitled-article";
}

export function resolveSlugCollision(desiredSlug: string, existingSlugs: Set<string> | string[]): string {
  const base = generateSlug(desiredSlug);
  const slugSet = existingSlugs instanceof Set ? existingSlugs : new Set(existingSlugs);
  if (!slugSet.has(base)) {
    return base;
  }
  let counter = 2;
  while (slugSet.has(`${base}-${counter}`)) {
    counter += 1;
  }
  return `${base}-${counter}`;
}

export function estimateReadingTimeMinutes(text: string): number {
  const plain = text.replace(/<[^>]*>/g, " ").trim();
  if (!plain) return 1;
  const wordCount = plain.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 220));
}
