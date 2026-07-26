/**
 * ============================================================================
 * Users Controller
 * ============================================================================
 *
 * Layer:
 * Controller / Interface Adapter
 *
 * Responsibility:
 * Processes HTTP requests relating to the User system. Separates actions into
 * user self-service (profile updates) and Admin capabilities (roles/permissions).
 *
 * Called By:
 * src/modules/users/users.b2c.routes.js
 * src/modules/users/users.admin.routes.js
 *
 * Depends On:
 * src/modules/users/users.service.js
 * ============================================================================
 */
import * as usersService from './users.service.js';
import { sendSuccess } from '#shared/utils/response.js';

export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const user = await usersService.getUserProfile(userId);
    return sendSuccess(res, 200, 'Profile fetched successfully', { user });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const updatedUser = await usersService.updateUserProfile(userId, req.body);
    return sendSuccess(res, 200, 'Profile updated successfully.', { user: updatedUser });
  } catch (err) {
    next(err);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const { page, limit, search, role, status } = req.query;
    const result = await usersService.listUsers({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      search,
      role,
      status,
    });
    return sendSuccess(res, 200, 'Users fetched successfully', result);
  } catch (err) {
    next(err);
  }
};

export const getUserDetails = async (req, res, next) => {
  try {
    const user = await usersService.getUserById(req.params.id);
    return sendSuccess(res, 200, 'User details fetched successfully', { user });
  } catch (err) {
    next(err);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const user = await usersService.updateUserStatus(req.params.id, status);
    return sendSuccess(res, 200, 'User status updated.', { user });
  } catch (err) {
    next(err);
  }
};

export const assignRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await usersService.assignUserRole(req.params.id, role);
    return sendSuccess(res, 200, 'User role updated.', { user });
  } catch (err) {
    next(err);
  }
};

export const assignPermissions = async (req, res, next) => {
  try {
    const { permissions } = req.body;
    const user = await usersService.assignUserPermissions(req.params.id, permissions);
    return sendSuccess(res, 200, 'User permissions updated.', { user });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    await usersService.deleteUser(req.params.id);
    return sendSuccess(res, 200, 'User soft deleted successfully.');
  } catch (err) {
    next(err);
  }
};
