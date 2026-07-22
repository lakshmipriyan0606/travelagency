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
import User from '../users/user.model.js';

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
  const hashed = await bcrypt.hash(password, 10);
  return await User.create({ name, email, password: hashed, role });
};

/**
 * Retrieves a user for authentication checks.
 *
 * @param {string} email
 * @returns {Promise<Object|null>}
 */
export const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

/**
 * Retrieves a user by ID without returning sensitive password data.
 * Useful for session hydration.
 *
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
export const findUserById = async (id) => {
  return await User.findById(id).select('-password');
};
