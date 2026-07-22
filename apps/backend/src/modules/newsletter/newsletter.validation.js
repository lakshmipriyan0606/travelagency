export const validateNewsletterInput = (data) => {
  const errors = [];
  if (!data.email || typeof data.email !== "string" || !data.email.trim()) {
    errors.push("Email is required.");
  } else if (!data.email.includes("@")) {
    errors.push("Invalid email format.");
  }
  return { isValid: errors.length === 0, errors };
};
