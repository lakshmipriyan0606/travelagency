export const sanitizeImagesArray = (arr) => {
  if (!Array.isArray(arr)) return [];
  return arr.map(img => {
    if (typeof img === 'string') {
      const url = img.trim();
      return (url && url.startsWith('http')) ? { url, alt: "" } : null;
    }
    if (img && typeof img === 'object' && typeof img.url === 'string') {
      const url = img.url.trim();
      if (url && url.startsWith('http')) {
        return { url, alt: (img.alt || "").toString() };
      }
    }
    return null;
  }).filter(Boolean);
};

export const sanitizeImageObjects = (images) => {
  return (images || []).map(img => {
    if (typeof img === 'string') return { url: img, alt: "" };
    if (img && typeof img === 'object') {
      if (img.url) return { url: img.url, alt: img.alt || "" };
      if (img[0] === 'h' && !img.url) {
        const recoveredUrl = Object.values(img).filter(val => typeof val === 'string').join('');
        return { url: recoveredUrl, alt: "" };
      }
      return img;
    }
    return { url: "", alt: "" };
  });
};
