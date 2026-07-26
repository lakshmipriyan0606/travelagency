/**
 * ============================================================================
 * Auth Controller
 * ============================================================================
 *
 * Layer:
 * Controller / Interface Adapter
 *
 * Responsibility:
 * Processes HTTP requests related to authentication, manages cookies,
 * issues JWT tokens, and maps HTTP payloads to business services.
 *
 * Called By:
 * src/modules/auth/auth.b2c.routes.js
 *
 * Depends On:
 * src/modules/auth/auth.service.js
 * src/modules/auth/auth.utils.js
 * ============================================================================
 */
import { setAuthCookies } from './auth.utils.js';
import * as authService from './auth.service.js';
import { sendSuccess } from '#shared/utils/response.js';

/**
 * Handle new user registration.
 *
 * Request Flow:
 * Client
 *   ↓
 * Route (POST /api/v1/b2c/auth/register)
 *   ↓
 * Validation (auth.validation.js)
 *   ↓
 * Controller (register)
 *   ↓
 * Service (registerUser)
 *   ↓
 * Database (Users Collection)
 *   ↓
 * Response (201 Created)
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await authService.registerUser(email, password, name, role);
    return sendSuccess(res, 201, 'Registered successfully', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle user login and JWT issuance.
 *
 * Request Flow:
 * Client
 *   ↓
 * Route (POST /api/v1/b2c-admin/auth/login)
 *   ↓
 * Controller (login)
 *   ↓
 * JWT Sign (generateAccessToken/generateRefreshToken)
 *   ↓
 * Response (Sets HttpOnly Cookies + Returns User Object)
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { accessToken, refreshToken, user } = await authService.loginUser(email, password);

    setAuthCookies(res, accessToken, refreshToken);

    return sendSuccess(res, 200, 'Logged in', { user, accessToken });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle JWT refresh using a valid refresh token.
 *
 * Business Intent:
 * Allows the client to obtain a new short-lived access token without requiring
 * the user to re-authenticate, provided their long-lived refresh token is valid.
 */
export const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refresh_token;
    const newAccessToken = await authService.refreshUserToken(refreshToken);

    setAuthCookies(res, newAccessToken);

    return sendSuccess(res, 200, 'Refreshed');
  } catch (error) {
    next(error);
  }
};

/**
 * Handle user logout by clearing auth cookies.
 */
export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refresh_token;
    await authService.logoutUser(refreshToken);

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return sendSuccess(res, 200, 'Logged out');
  } catch (error) {
    next(error);
  }
};

/**
 * Get current session identity based on HttpOnly cookie.
 *
 * Business Intent:
 * Used by the frontend SPA on initialization to verify if an active session
 * exists and to hydrate the current user's profile and RBAC roles.
 */
export const getSession = async (req, res, next) => {
  try {
    const token =
      req.cookies.access_token ||
      (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    const sessionData = await authService.getSessionData(token);

    return sendSuccess(res, 200, 'Session retrieved', sessionData);
  } catch (error) {
    next(error);
  }
};
