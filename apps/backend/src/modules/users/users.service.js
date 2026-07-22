import * as userRepository from "./users.repository.js";
import { validateUpdateProfile, validateRoleAssignment } from "./users.validation.js";

export const getUserProfile = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) throw new Error("User not found.");
  return user;
};

export const updateUserProfile = async (userId, profileData) => {
  const { isValid, errors } = validateUpdateProfile(profileData);
  if (!isValid) throw new Error(errors.join(" "));

  const allowedUpdates = {};
  if (profileData.name !== undefined) allowedUpdates.name = profileData.name;
  if (profileData.phone !== undefined) allowedUpdates.phone = profileData.phone;
  if (profileData.avatarUrl !== undefined) allowedUpdates.avatarUrl = profileData.avatarUrl;
  if (profileData.preferences !== undefined) allowedUpdates.preferences = profileData.preferences;

  return await userRepository.updateById(userId, allowedUpdates);
};

export const listUsers = async (options) => {
  return await userRepository.findAll({}, options);
};

export const getUserById = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) throw new Error("User not found.");
  return user;
};

export const updateUserStatus = async (userId, status) => {
  return await userRepository.updateById(userId, { status });
};

export const assignUserRole = async (userId, role) => {
  if (!validateRoleAssignment(role)) throw new Error("Invalid user role specified.");
  return await userRepository.updateById(userId, { role });
};

export const assignUserPermissions = async (userId, permissions) => {
  return await userRepository.updateById(userId, { permissions });
};

export const deleteUser = async (userId) => {
  return await userRepository.softDelete(userId);
};
