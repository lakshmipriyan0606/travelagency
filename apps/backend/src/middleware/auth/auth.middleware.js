/**
 * ============================================================================
 * Authentication & Authorization Middleware
 * ============================================================================
 *
 * Layer:
 * Middleware / Security
 *
 * Responsibility:
 * Verifies JWT tokens to authenticate users. Attaches the resolved user
 * entity to the Request object. Also provides Role-Based Access Control (RBAC)
 * guards to restrict access to specific administrative endpoints.
 *
 * Called By:
 * Feature Module Gateways (e.g. src/app/gateways/b2c-admin.gateway.js)
 *
 * Depends On:
 * src/modules/users/user.model.js
 * ============================================================================
 */
import jwt from 'jsonwebtoken';
import User from '../../modules/users/user.model.js';

/**
 * Ensures the requester has a valid JWT token.
 * Populates `req.user` if successful.
 */
export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.access_token;

    if (!token) return res.status(401).json({ message: 'Unauthorized: No Token' });

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET || 'access_secret'
    );

    req.user = await User.findById(decoded.id).select('-password');

    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

/**
 * RBAC Guard: Allows only 'admin' and 'superadmin' roles.
 * Must be executed AFTER protectRoute.
 */
export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin' && req.user?.role !== 'superadmin')
    return res.status(403).json({ message: 'Access denied' });

  next();
};

/**
 * RBAC Guard: Allows ONLY 'superadmin' role.
 * Must be executed AFTER protectRoute.
 */
export const superAdminOnly = (req, res, next) => {
  if (req.user?.role !== 'superadmin') return res.status(403).json({ message: 'Access denied' });

  next();
};
