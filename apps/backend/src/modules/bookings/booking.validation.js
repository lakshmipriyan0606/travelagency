export const validateBookingInput = (data) => {
  const errors = [];
  if (!data.name || typeof data.name !== "string" || !data.name.trim()) {
    errors.push("Name is required.");
  }
  if (!data.destination || typeof data.destination !== "string" || !data.destination.trim()) {
    errors.push("Destination is required.");
  }
  if (data.email && !data.email.includes("@")) {
    errors.push("Invalid email format.");
  }
  return { isValid: errors.length === 0, errors };
};
