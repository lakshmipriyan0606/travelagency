/**
 * ============================================================================
 * Token Generation Utilities
 * ============================================================================
 *
 * Layer:
 * Shared Utility / Security
 *
 * Responsibility:
 * Centralizes the signing of JWT tokens using the application secret.
 * Supports both short-lived access tokens and long-lived refresh tokens.
 *
 * Called By:
 * src/modules/auth/auth.controller.js
 * ============================================================================
 */
import jwt from 'jsonwebtoken';

export const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};

export const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};
