export const validateStoryInput = (data) => {
  const errors = [];
  if (!data.url || typeof data.url !== 'string' || !data.url.trim()) {
    errors.push('Story image/video URL is required.');
  }
  if (data.row !== undefined && ![1, 2].includes(Number(data.row))) {
    errors.push('Row must be either 1 or 2.');
  }
  return { isValid: errors.length === 0, errors };
};
