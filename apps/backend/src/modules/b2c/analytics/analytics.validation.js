export const validateVisitorInput = (data) => {
  const errors = [];
  if (!data.visitorId || typeof data.visitorId !== 'string' || !data.visitorId.trim()) {
    errors.push('visitorId is required.');
  }
  return { isValid: errors.length === 0, errors };
};
