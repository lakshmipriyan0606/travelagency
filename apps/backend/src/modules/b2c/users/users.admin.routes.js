import express from 'express';
import { protectRoute, adminOnly } from '#b2c/middleware/auth.middleware.js';
import {
  getProfile,
  updateProfile,
  getUsers,
  getUserDetails,
  updateUserStatus,
  assignRole,
  assignPermissions,
  deleteUser,
} from './users.controller.js';

// Self Profile Routes

// Admin User Management Routes

const router = express.Router();

router.get('/profile', protectRoute, getProfile);
router.put('/profile', protectRoute, updateProfile);
router.get('/', protectRoute, adminOnly, getUsers);
router.get('/:id', protectRoute, adminOnly, getUserDetails);
router.patch('/:id/status', protectRoute, adminOnly, updateUserStatus);
router.patch('/:id/role', protectRoute, adminOnly, assignRole);
router.patch('/:id/permissions', protectRoute, adminOnly, assignPermissions);
router.delete('/:id', protectRoute, adminOnly, deleteUser);

export default router;
