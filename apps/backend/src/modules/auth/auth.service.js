/**
 * ============================================================================
 * Auth Service
 * ============================================================================
 *
 * Layer:
 * Business Service
 *
 * Responsibility:
 * Encapsulates core authentication rules such as password hashing and user
 * lookups. Keeps controllers thin and free of database specifics.
 *
 * Called By:
 * auth.controller.js
 *
 * Depends On:
 * src/modules/users/user.model.js
 * ============================================================================
 */
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppError } from '#middleware/error/AppError.js';
import * as userRepository from '../users/users.repository.js';
import cache from '#config/cache.js';
import { generateAccessToken, generateRefreshToken } from './auth.utils.js';

/**
 * Registers a new user with a securely hashed password.
 *
 * Business Intent:
 * Abstract the password hashing (bcrypt) away from the controller to ensure
 * security rules are consistently applied before persistence.
 *
 * @param {string} email
 * @param {string} password - Raw password to hash
 * @param {string} name
 * @param {string} role - Default is "user"
 * @returns {Promise<Object>} Created user document
 */
export const registerUser = async (email, password, name = '', role = 'user') => {
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new AppError('Email already exists', 400);
  }

  const hashed = await bcrypt.hash(password, 10);
  return await userRepository.create({ name, email, password: hashed, role });
};

/**
 * Retrieves a user for authentication checks.
 *
 * @param {string} email
 * @returns {Promise<Object|null>}
 */
export const findUserByEmail = async (email) => {
  return await userRepository.findByEmail(email);
};

/**
 * Retrieves a user by ID without returning sensitive password data.
 * Useful for session hydration.
 *
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
export const findUserById = async (id) => {
  return await userRepository.findById(id);
};

export const loginUser = async (email, password) => {
  const user = await findUserByEmail(email);
  if (!user) throw new AppError('No user found', 404);

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new AppError('Wrong password', 401);

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const decodedToken = jwt.decode(accessToken);
  const userObj = typeof user.toObject === 'function' ? user.toObject() : { ...user };
  if (decodedToken && decodedToken.exp) {
    userObj.exp = decodedToken.exp;
  }

  return { accessToken, refreshToken, user: userObj };
};

export const refreshUserToken = async (refreshToken) => {
  if (!refreshToken) throw new AppError('No refresh token', 401);

  const isRevoked = await cache.get(`revoked_token:${refreshToken}`);
  if (isRevoked) {
    throw new AppError('Refresh token has been revoked', 403);
  }

  let decoded;
  try {
    decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'refresh_secret'
    );
  } catch (err) {
    throw new AppError('Invalid refresh token', 403);
  }

  const newAccessToken = jwt.sign(
    { id: decoded.id, role: decoded.role },
    process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'access_secret',
    { expiresIn: process.env.JWT_ACCESS_EXPIRE || '59m' }
  );

  return newAccessToken;
};

export const logoutUser = async (refreshToken) => {
  if (!refreshToken) return;
  try {
    const decoded = jwt.decode(refreshToken);
    if (decoded && decoded.exp) {
      const timeToLive = decoded.exp - Math.floor(Date.now() / 1000);
      if (timeToLive > 0) {
        await cache.set(`revoked_token:${refreshToken}`, 'revoked', 'EX', timeToLive);
      }
    }
  } catch (err) {
    // Ignored for logout
  }
};

export const getSessionData = async (token) => {
  if (!token) return { isLoggedIn: false };

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET || 'access_secret'
    );

    const currentUser = await findUserById(decoded.id);

    if (!currentUser) {
      return { isLoggedIn: false };
    }

    return {
      isLoggedIn: true,
      id: decoded.id,
      role: currentUser.role || 'user',
      user: {
        name: currentUser.name || '',
        email: currentUser.email || '',
        exp: decoded.exp,
      },
    };
  } catch (err) {
    return { isLoggedIn: false };
  }
};
