export const validateBlogInput = (data) => {
  const errors = [];
  if (!data.title || typeof data.title !== "string" || !data.title.trim()) {
    errors.push("Blog title is required.");
  }
  if (!data.category || typeof data.category !== "string" || !data.category.trim()) {
    errors.push("Blog category is required.");
  }
  if (!data.author || typeof data.author !== "string" || !data.author.trim()) {
    errors.push("Author name is required.");
  }
  if (!data.content || typeof data.content !== "string" || !data.content.trim()) {
    errors.push("Blog content is required.");
  }
  return { isValid: errors.length === 0, errors };
};
