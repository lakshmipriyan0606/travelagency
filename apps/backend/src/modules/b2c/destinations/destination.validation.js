export const validateDestinationInput = (data) => {
  const errors = [];
  if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
    errors.push('Destination title is required.');
  }
  if (!data.location || typeof data.location !== 'string' || !data.location.trim()) {
    errors.push('Navigation location/city is required.');
  }
  if (!data.url || typeof data.url !== 'string' || !data.url.trim()) {
    errors.push('Image URL is required.');
  }
  return { isValid: errors.length === 0, errors };
};
