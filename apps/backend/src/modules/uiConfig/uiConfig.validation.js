export const normalizeImages = (images, legacySingle) => {
  const arr = Array.isArray(images) ? images : [];

  const cleaned = arr
    .map((item) => {
      if (typeof item === "string") {
        const url = item.trim();
        return url ? { url, alt: "" } : null;
      }
      if (item && typeof item === "object") {
        const url = (item.url ?? "").toString().trim();
        if (!url) return null;
        const alt = (item.alt ?? "").toString();
        return { url, alt };
      }
      return null;
    })
    .filter(Boolean)
    .slice(0, 5);

  if (cleaned.length) return cleaned;
  const legacy = (legacySingle ?? "").toString().trim();
  return legacy ? [{ url: legacy, alt: "" }] : [];
};
