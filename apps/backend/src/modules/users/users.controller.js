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

/**
 * Fetch own profile data using token ID.
 */
export const getProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const user = await usersService.getUserProfile(userId);
    res.json({ success: true, user });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

/**
 * Update own profile details.
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const updatedUser = await usersService.updateUserProfile(userId, req.body);
    res.json({ success: true, message: 'Profile updated successfully.', user: updatedUser });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * Admin view: Get paginated/filtered list of all users.
 */
export const getUsers = async (req, res) => {
  try {
    const { page, limit, search, role, status } = req.query;
    const result = await usersService.listUsers({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      search,
      role,
      status,
    });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Admin view: Detailed view of a single user.
 */
export const getUserDetails = async (req, res) => {
  try {
    const user = await usersService.getUserById(req.params.id);
    res.json({ success: true, user });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const user = await usersService.updateUserStatus(req.params.id, status);
    res.json({ success: true, message: 'User status updated.', user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const assignRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await usersService.assignUserRole(req.params.id, role);
    res.json({ success: true, message: 'User role updated.', user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const assignPermissions = async (req, res) => {
  try {
    const { permissions } = req.body;
    const user = await usersService.assignUserPermissions(req.params.id, permissions);
    res.json({ success: true, message: 'User permissions updated.', user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await usersService.deleteUser(req.params.id);
    res.json({ success: true, message: 'User soft deleted successfully.' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
