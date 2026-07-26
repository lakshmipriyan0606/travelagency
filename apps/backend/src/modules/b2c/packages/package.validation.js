export const validatePackageInput = (body) => {
  const errors = [];
  if (!body.packageName || typeof body.packageName !== 'string' || !body.packageName.trim()) {
    errors.push('Package name is required.');
  }
  if (
    !body.packageDescription ||
    typeof body.packageDescription !== 'string' ||
    !body.packageDescription.trim()
  ) {
    errors.push('Package description is required.');
  }
  if (!body.location || typeof body.location !== 'string' || !body.location.trim()) {
    errors.push('Location is required.');
  }
  if (!body.country || typeof body.country !== 'string' || !body.country.trim()) {
    errors.push('Country is required.');
  }
  return { isValid: errors.length === 0, errors };
};
