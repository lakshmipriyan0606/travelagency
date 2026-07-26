import jwt from 'jsonwebtoken';
import { AgencyUser } from '../models/agencyUser.model.js';
import { Agency } from '../models/agency.model.js';
import { AdminUser } from '../models/adminUser.model.js';
import { AppError } from '#shared/errors/AppError.js';
import { logger } from '#shared/utils/logger.js';

/**
 * Middleware to authenticate and authorize B2B Agency Users.
 * Verifies JWT signature, ensures 'agency' scope, and checks that both
 * the user and agency are active.
 */
export const requireAgencyAuth = async (req, res, next) => {
  try {
    const token =
      req.cookies.access_token ||
      (req.headers.authorization && req.headers.authorization.split(' ')[1]);

    if (!token) {
      return next(new AppError('Unauthorized: No access token provided', 401));
    }

    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
    const decoded = jwt.verify(token, jwtSecret);

    if (decoded.scope !== 'agency') {
      return next(new AppError('Forbidden: Invalid token scope', 403));
    }

    const agencyUser = await AgencyUser.findById(decoded.sub);
    if (!agencyUser) {
      return next(new AppError('Unauthorized: User not found', 401));
    }

    if (!agencyUser.isActive) {
      return next(new AppError('Forbidden: User account is inactive', 403));
    }

    const agency = await Agency.findById(agencyUser.agencyId);
    if (!agency || agency.isDeleted) {
      return next(new AppError('Unauthorized: Agency not found', 401));
    }

    if (agency.status !== 'active') {
      return next(new AppError(`Forbidden: Agency account is ${agency.status}`, 403));
    }

    // Attach entities to request object
    req.user = agencyUser;
    req.agency = agency;
    next();
  } catch (error) {
    logger.warn({ err: error }, 'B2B agency authentication failed');
    return next(new AppError('Unauthorized: Invalid or expired token', 401));
  }
};

/**
 * Higher-order middleware to authenticate and authorize Admin Users by role.
 * Verifies JWT signature, ensures 'admin' scope, verifies admin is active,
 * and asserts role matches permitted options.
 *
 * @param {...string} allowedRoles - Permitted administrative roles
 */
export const requireAdminRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const token =
        req.cookies.access_token ||
        (req.headers.authorization && req.headers.authorization.split(' ')[1]);

      if (!token) {
        return next(new AppError('Unauthorized: No access token provided', 401));
      }

      const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
      const decoded = jwt.verify(token, jwtSecret);

      if (decoded.scope !== 'admin') {
        return next(new AppError('Forbidden: Invalid token scope', 403));
      }

      const adminUser = await AdminUser.findById(decoded.sub);
      if (!adminUser) {
        return next(new AppError('Unauthorized: Admin user not found', 401));
      }

      if (!adminUser.isActive) {
        return next(new AppError('Forbidden: Admin account is inactive', 403));
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(adminUser.role)) {
        return next(new AppError('Forbidden: Access denied for this role', 403));
      }

      // Attach admin entity to request object
      req.admin = adminUser;
      next();
    } catch (error) {
      logger.warn({ err: error }, 'B2B admin authentication failed');
      return next(new AppError('Unauthorized: Invalid or expired token', 401));
    }
  };
};
