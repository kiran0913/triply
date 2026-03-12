/**
 * Generate URL-safe slug from trip title and destination.
 * Format: destination-title-year (e.g. bali-adventure-2025)
 */

export function generateTripSlug(title: string, destination: string, startDate?: Date | string): string {
  const parts: string[] = [];
  const destSlug = slugify(destination);
  const titleSlug = slugify(title);
  if (destSlug) parts.push(destSlug);
  if (titleSlug && titleSlug !== destSlug) parts.push(titleSlug);
  if (startDate) {
    const d = typeof startDate === "string" ? new Date(startDate) : startDate;
    if (!isNaN(d.getTime())) {
      parts.push(String(d.getFullYear()));
    }
  }
  return parts.length > 0 ? parts.join("-") : `trip-${Date.now()}`;
}

function slugify(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50) || "trip";
}

export function ensureUniqueSlug(
  baseSlug: string,
  exists: (slug: string) => Promise<boolean>
): Promise<string> {
  return (async () => {
    let slug = baseSlug;
    let n = 0;
    while (await exists(slug)) {
      n++;
      slug = `${baseSlug}-${n}`;
    }
    return slug;
  })();
}
