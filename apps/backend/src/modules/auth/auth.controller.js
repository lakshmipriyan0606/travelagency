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
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateAccessToken, generateRefreshToken } from './auth.utils.js';
import { findUserByEmail, findUserById, registerUser } from './auth.service.js';

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
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check uniqueness early to avoid hashing overhead on duplicates
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ msg: 'Email already exists' });
    }

    await registerUser(email, password, name, role);

    res.status(201).json({ msg: 'Registered successfully' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
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
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ msg: 'No user found' });

    // Validate raw password against bcrypt hash
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ msg: 'Wrong password' });

    // Issue short-lived access token and long-lived refresh token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const isProduction = process.env.NODE_ENV === 'production';

    // Set secure, HTTP-only cookies to prevent XSS attacks extracting the JWT
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'strict',
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'strict',
    });

    // Hydrate expiration onto the user object for frontend session management
    const decodedToken = jwt.decode(accessToken);
    const userObj = user.toObject();
    if (decodedToken && decodedToken.exp) {
      userObj.exp = decodedToken.exp;
    }

    res.json({ msg: 'Logged in', user: userObj });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

/**
 * Handle JWT refresh using a valid refresh token.
 *
 * Business Intent:
 * Allows the client to obtain a new short-lived access token without requiring
 * the user to re-authenticate, provided their long-lived refresh token is valid.
 */
export const refresh = (req, res) => {
  const refreshToken = req.cookies.refresh_token;

  if (!refreshToken) return res.status(401).json({ msg: 'No refresh token' });

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'refresh_secret'
    );

    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'access_secret',
      { expiresIn: process.env.JWT_ACCESS_EXPIRE || '59m' }
    );

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('access_token', newAccessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'strict',
    });

    return res.json({ msg: 'Refreshed' });
  } catch (err) {
    return res.status(403).json({ msg: 'Invalid refresh token' });
  }
};

/**
 * Handle user logout by clearing auth cookies.
 */
export const logout = (req, res) => {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  res.json({ msg: 'Logged out' });
};

/**
 * Get current session identity based on HttpOnly cookie.
 *
 * Business Intent:
 * Used by the frontend SPA on initialization to verify if an active session
 * exists and to hydrate the current user's profile and RBAC roles.
 */
export const getSession = async (req, res) => {
  try {
    const token = req.cookies.access_token;

    if (!token) {
      return res.json({ isLoggedIn: false });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET || 'access_secret'
    );

    const currentUser = await findUserById(decoded.id);

    if (!currentUser) {
      return res.json({ isLoggedIn: false });
    }

    return res.json({
      isLoggedIn: true,
      id: decoded.id,
      role: currentUser.role || 'user',
      user: {
        name: currentUser.name || '',
        email: currentUser.email || '',
        exp: decoded.exp,
      },
    });
  } catch (err) {
    return res.json({ isLoggedIn: false });
  }
};
