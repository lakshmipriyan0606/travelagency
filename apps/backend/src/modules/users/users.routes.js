import express from "express";
import { protectRoute, adminOnly } from "../../middleware/auth/auth.middleware.js";
import {
  getProfile,
  updateProfile,
  getUsers,
  getUserDetails,
  updateUserStatus,
  assignRole,
  assignPermissions,
  deleteUser
} from "./users.controller.js";

const router = express.Router();

// Self Profile Routes
router.get("/profile", protectRoute, getProfile);
router.put("/profile", protectRoute, updateProfile);

// Admin User Management Routes
router.get("/", protectRoute, adminOnly, getUsers);
router.get("/:id", protectRoute, adminOnly, getUserDetails);
router.patch("/:id/status", protectRoute, adminOnly, updateUserStatus);
router.patch("/:id/role", protectRoute, adminOnly, assignRole);
router.patch("/:id/permissions", protectRoute, adminOnly, assignPermissions);
router.delete("/:id", protectRoute, adminOnly, deleteUser);

export default router;
