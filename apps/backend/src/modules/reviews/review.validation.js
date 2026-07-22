export const validateReviewInput = (data) => {
  const errors = [];
  if (!data.name || typeof data.name !== "string" || !data.name.trim()) {
    errors.push("Name is required.");
  }
  if (!data.content || typeof data.content !== "string" || !data.content.trim()) {
    errors.push("Review content is required.");
  }
  if (!data.location || typeof data.location !== "string" || !data.location.trim()) {
    errors.push("Location is required.");
  }
  if (data.rating !== undefined && (data.rating < 1 || data.rating > 5)) {
    errors.push("Rating must be between 1 and 5.");
  }
  return { isValid: errors.length === 0, errors };
};
