const ALLOWED_TAGS = new Set([
  "p", "h2", "h3", "h4", "strong", "em", "u", "s", "blockquote",
  "ul", "ol", "li", "code", "pre", "a", "img", "hr", "br", "figure", "figcaption"
]);

export function sanitizeEditorialHtml(dirtyHtml: string): string {
  if (!dirtyHtml || typeof dirtyHtml !== "string") return "";

  // Strip script, iframe, object, embed, style, form, svgonload, and event handlers
  let clean = dirtyHtml
    .replace(/<(script|iframe|object|embed|style|form|input|button|textarea|select|meta|link)[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<(script|iframe|object|embed|style|form|input|button|textarea|select|meta|link)[^>]*\/?>/gi, "")
    .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript\s*:/gi, "")
    .replace(/vbscript\s*:/gi, "")
    .replace(/data\s*:\s*text\/html/gi, "");

  // Filter unknown tags while preserving safe attributes on <a> and <img>
  clean = clean.replace(/<(\/?)([a-z0-9-]+)([^>]*)>/gi, (match, slash, tagName, attrs) => {
    const lower = String(tagName).toLowerCase();
    if (!ALLOWED_TAGS.has(lower)) {
      return "";
    }
    if (slash) {
      return `</${lower}>`;
    }
    if (lower === "a") {
      const hrefMatch = String(attrs).match(/href\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
      const rawHref = hrefMatch ? (hrefMatch[1] ?? hrefMatch[2] ?? "") : "";
      const isSafeHref = /^(https?:\/\/|mailto:|\/|#)/i.test(rawHref.trim());
      const safeHref = isSafeHref ? rawHref.trim().replace(/"/g, "&quot;") : "#";
      return `<a href="${safeHref}" rel="noopener noreferrer">`;
    }
    if (lower === "img") {
      const srcMatch = String(attrs).match(/src\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
      const altMatch = String(attrs).match(/alt\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
      const rawSrc = srcMatch ? (srcMatch[1] ?? srcMatch[2] ?? "") : "";
      const rawAlt = altMatch ? (altMatch[1] ?? altMatch[2] ?? "") : "";
      const isSafeSrc = /^(https?:\/\/|\/images\/|\/uploads\/)/i.test(rawSrc.trim());
      if (!isSafeSrc) return "";
      const safeSrc = rawSrc.trim().replace(/"/g, "&quot;");
      const safeAlt = rawAlt.trim().replace(/"/g, "&quot;");
      return `<img src="${safeSrc}" alt="${safeAlt}" loading="lazy" />`;
    }
    return `<${lower}>`;
  });

  return clean.trim();
}
