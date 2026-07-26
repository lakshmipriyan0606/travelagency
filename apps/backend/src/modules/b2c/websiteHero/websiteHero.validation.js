import { MAX_HERO_IMAGES } from './websiteHero.constants.js';

export const normalizeImages = (images) => {
  const arr = Array.isArray(images) ? images : [];
  return arr
    .map((item) => {
      if (typeof item === 'string') {
        const url = item.trim();
        return url ? { url, alt: '' } : null;
      }
      if (item && typeof item === 'object') {
        const url = (item.url ?? '').toString().trim();
        if (!url) return null;
        const alt = (item.alt ?? '').toString();
        return { url, alt };
      }
      return null;
    })
    .filter(Boolean)
    .slice(0, MAX_HERO_IMAGES);
};
