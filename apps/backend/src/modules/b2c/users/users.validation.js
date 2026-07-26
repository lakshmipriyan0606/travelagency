export const validateUpdateProfile = (data) => {
  const errors = [];
  if (data.email && !data.email.includes('@')) {
    errors.push('Invalid email address format.');
  }
  if (data.phone && typeof data.phone !== 'string') {
    errors.push('Phone number must be a string.');
  }
  return { isValid: errors.length === 0, errors };
};

export const validateRoleAssignment = (role) => {
  const validRoles = ['user', 'agent', 'admin', 'superadmin'];
  return validRoles.includes(role);
};
