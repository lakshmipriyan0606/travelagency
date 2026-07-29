/**
 * ============================================================================
 * B2B Authentication Controller
 * ============================================================================
 *
 * Layer:
 * Controller / Interface Adapter
 *
 * Responsibility:
 * Processes B2B HTTP requests related to agency registration, login, token refresh,
 * logout, and current session hydration.
 *
 * Known Limitation:
 * Due to MongoDB replica-set transaction requirements, the registration process
 * utilizes a manual rollback strategy. If the creation of the AgencyUser document
 * fails after the Agency document is successfully created, the Agency document
 * is deleted. If a server crash occurs between these two steps, an orphaned
 * pending Agency document may remain in the database.
 * ============================================================================
 */

import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { Agency } from '../models/agency.model.js';
import { AgencyUser } from '../models/agencyUser.model.js';
import { AdminUser } from '../models/adminUser.model.js';
import { RefreshToken } from '../models/refreshToken.model.js';
import { AppError } from '#shared/errors/AppError.js';
import { sendSuccess } from '#shared/utils/response.js';
import { notifyAgency } from '../services/notifications.service.js';
import { logger } from '#shared/utils/logger.js';

// Centralized security configurations
const BCRYPT_SALT_ROUNDS = 12;

/**
 * Helper to compute SHA-256 hash of a string.
 * Used for storing and looking up refresh tokens securely.
 */
const hashSha256 = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Handles the registration of a new B2B travel agency.
 * Creates an Agency document (status 'pending') and an AgencyUser document (role 'owner')
 * within a manual rollback configuration.
 *
 * @param {import('express').Request} req - Express Request object
 * @param {import('express').Response} res - Express Response object
 * @param {import('express').NextFunction} next - Express Next function
 * @returns {Promise<void>}
 */
export const register = async (req, res, next) => {
  const {
    companyName,
    tradeName,
    businessType,
    registrationNumber,
    country,
    gstNumber,
    officeAddress,
    websiteUrl,
    yearsInBusiness,
    iataNumber,
    name,
    email,
    phone,
    designation,
    password,
  } = req.body;

  let createdAgency;

  try {
    // 1. Validate AgencyUser email uniqueness FIRST to prevent side effects
    const normalizedEmail = String(email).toLowerCase().trim();
    const emailExists = await AgencyUser.findOne({ email: normalizedEmail });
    if (emailExists) {
      const agency = await Agency.findById(emailExists.agencyId);
      let errorCode = 'ALREADY_ACTIVE';
      if (agency) {
        if (agency.status === 'pending') errorCode = 'ALREADY_PENDING';
        else if (agency.status === 'needs_correction') errorCode = 'NEEDS_CORRECTION';
        else if (agency.status === 'suspended') errorCode = 'ACCOUNT_SUSPENDED';
        else if (agency.status === 'rejected') errorCode = 'ACCOUNT_REJECTED';
      }
      const err = new AppError('Email already registered', 409);
      err.code = errorCode;
      return next(err);
    }

    // 2. Hash password with bcrypt cost factor 12
    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    // 3. Create the Agency document (default status is 'pending')
    try {
      createdAgency = await Agency.create({
        companyName,
        tradeName,
        businessType,
        registrationNumber,
        country,
        gstNumber: country === 'India' ? gstNumber : undefined,
        officeAddress,
        websiteUrl,
        yearsInBusiness,
        iataNumber,
        status: 'pending',
      });
    } catch (dbError) {
      logger.error({ err: dbError }, 'Database error during Agency document creation');
      return next(new AppError('Failed to create agency record', 500));
    }

    // 4. Create the AgencyUser document with role 'owner'
    // Manual rollback is triggered if this operation fails.
    try {
      await AgencyUser.create({
        agencyId: createdAgency._id,
        name,
        email: normalizedEmail,
        phone,
        designation,
        passwordHash,
        role: 'owner',
        isActive: true,
      });
    } catch (userError) {
      logger.error(
        { err: userError, agencyId: createdAgency._id },
        'Failed to create AgencyUser. Initiating manual rollback for Agency document'
      );

      // Perform manual rollback of the created Agency
      try {
        await Agency.deleteOne({ _id: createdAgency._id });
        logger.info(
          { agencyId: createdAgency._id },
          'Manual rollback successful: Agency document deleted'
        );
      } catch (rollbackError) {
        logger.error(
          { err: rollbackError, agencyId: createdAgency._id },
          'CRITICAL: Manual rollback failed. Orphaned Agency document remains in database'
        );
      }

      // Bubble up the original creation failure error
      if (userError.name === 'ValidationError') {
        return next(new AppError(userError.message, 400));
      }
      return next(new AppError('Failed to create agency owner account', 500));
    }

    // 5. Trigger notification stub for registration
    try {
      await notifyAgency(createdAgency, 'registered');
    } catch (notifyError) {
      // Non-blocking log, registration is still functionally successful
      logger.warn(
        { err: notifyError, agencyId: createdAgency._id },
        'B2B registration success, but notifications stub failed'
      );
    }

    // 6. Return standard standard success response
    return sendSuccess(
      res,
      201,
      'Agency registration submitted successfully. Account is pending approval.',
      {
        agencyId: createdAgency._id,
      }
    );
  } catch (unexpectedError) {
    logger.error(
      { err: unexpectedError },
      'Unexpected error during B2B agency registration process'
    );
    return next(new AppError('Internal server error during registration', 500));
  }
};

/**
 * Handles the login authentication of a B2B AgencyUser.
 * Verifies email/password against database records (with .select('+passwordHash')),
 * checks user and agency statuses, issues access and refresh tokens, and registers
 * the active session.
 *
 * @param {import('express').Request} req - Express Request object
 * @param {import('express').Response} res - Express Response object
 * @param {import('express').NextFunction} next - Express Next function
 * @returns {Promise<void>}
 */
export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // 1. Normalize input email
    const normalizedEmail = String(email).toLowerCase().trim();

    // 2. Fetch AgencyUser with passwordHash explicitly selected
    const agencyUser = await AgencyUser.findOne({ email: normalizedEmail }).select('+passwordHash');
    if (!agencyUser) {
      // Step 3: Generic 401 on non-existent email
      return next(new AppError('Invalid credentials', 401));
    }

    // Fetch the parent Agency document
    const agency = await Agency.findById(agencyUser.agencyId);
    if (!agency || agency.isDeleted) {
      return next(new AppError('Invalid credentials', 401));
    }

    // 4. Compare credentials using bcrypt.compare
    const isPasswordValid = await bcrypt.compare(password, agencyUser.passwordHash);
    if (!isPasswordValid) {
      return next(new AppError('Invalid credentials', 401));
    }

    // 5. Check active status of the user account
    if (!agencyUser.isActive) {
      return next(new AppError('Account is inactive', 403));
    }

    // 6. Check status of the travel agency
    switch (agency.status) {
      case 'pending':
        return next(new AppError('Your account is pending approval', 403));
      case 'suspended':
        return next(new AppError('Your account has been suspended', 403));
      case 'active':
      case 'needs_correction':
      case 'rejected':
        break; // proceed to login
      default:
        return next(new AppError('Account status error', 403));
    }

    // 7. Generate JWT access token (15 minute expiration)
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
    const accessToken = jwt.sign(
      {
        sub: agencyUser._id,
        agencyId: agency._id,
        scope: 'agency',
        role: agencyUser.role,
      },
      jwtSecret,
      { expiresIn: '15m' }
    );

    // 8. Generate raw refresh token, hash it using SHA-256, and store in database
    const rawRefreshToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashSha256(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await RefreshToken.create({
      userId: agencyUser._id,
      scope: 'agency',
      tokenHash,
      expiresAt,
    });

    // 9. Update last login timestamp for the user
    agencyUser.lastLoginAt = new Date();
    await agencyUser.save();

    // 10. Return standard success payload
    return sendSuccess(res, 200, 'Logged in successfully', {
      accessToken,
      refreshToken: rawRefreshToken,
      agencyUser: {
        id: agencyUser._id,
        name: agencyUser.name,
        email: agencyUser.email,
        role: agencyUser.role,
      },
    });
  } catch (error) {
    logger.error({ err: error }, 'Unexpected error during B2B agency login');
    return next(new AppError('Internal server error during login', 500));
  }
};

/**
 * Shared utility to handle Refresh Token rotation.
 * Validates, revokes, and issues a new pair of Access & Refresh tokens.
 */
const rotateToken = async (req, res, next, expectedScope) => {
  const rawRefreshToken = req.cookies.refresh_token || req.body.refreshToken;
  if (!rawRefreshToken) {
    return next(new AppError('Unauthorized: Missing refresh token', 401));
  }

  try {
    const tokenHash = hashSha256(rawRefreshToken);
    const tokenDoc = await RefreshToken.findOne({ tokenHash, scope: expectedScope });

    if (!tokenDoc || tokenDoc.revoked || tokenDoc.expiresAt < new Date()) {
      return next(new AppError('Unauthorized: Invalid, expired, or revoked refresh token', 401));
    }

    let payloadSub = tokenDoc.userId;
    let agencyId = null;
    let role = '';

    if (expectedScope === 'agency') {
      const user = await AgencyUser.findById(tokenDoc.userId);
      if (!user || !user.isActive) {
        return next(new AppError('Unauthorized: User account suspended or deleted', 401));
      }
      const agency = await Agency.findById(user.agencyId);
      if (!agency || agency.status !== 'active' || agency.isDeleted) {
        return next(new AppError('Forbidden: Agency account inactive or suspended', 403));
      }
      agencyId = agency._id;
      role = user.role;
    } else if (expectedScope === 'admin') {
      const admin = await AdminUser.findById(tokenDoc.userId);
      if (!admin || !admin.isActive) {
        return next(new AppError('Unauthorized: Admin account suspended or deleted', 401));
      }
      role = admin.role;
    }

    // Revoke old refresh token
    tokenDoc.revoked = true;
    await tokenDoc.save();

    // Generate new JWT Access Token
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
    const accessToken = jwt.sign(
      {
        sub: payloadSub,
        ...(agencyId ? { agencyId } : {}),
        scope: expectedScope,
        role,
      },
      jwtSecret,
      { expiresIn: '15m' }
    );

    // Generate new Refresh Token
    const newRawRefreshToken = crypto.randomBytes(32).toString('hex');
    const newHash = hashSha256(newRawRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await RefreshToken.create({
      userId: payloadSub,
      scope: expectedScope,
      tokenHash: newHash,
      expiresAt,
    });

    return sendSuccess(res, 200, 'Tokens rotated successfully', {
      accessToken,
      refreshToken: newRawRefreshToken,
    });
  } catch (error) {
    logger.error({ err: error }, 'Token rotation execution error');
    return next(new AppError('Internal server error during token refresh', 500));
  }
};

/**
 * Shared utility to handle Refresh Token revocation (logout).
 */
const revokeToken = async (req, res, next, expectedScope) => {
  const rawRefreshToken = req.cookies.refresh_token || req.body.refreshToken;
  if (rawRefreshToken) {
    try {
      const tokenHash = hashSha256(rawRefreshToken);
      await RefreshToken.updateMany({ tokenHash, scope: expectedScope }, { revoked: true });
    } catch (error) {
      logger.warn({ err: error }, 'Error revoking token during logout');
    }
  }

  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  return sendSuccess(res, 200, 'Logged out successfully');
};

// --- Agency Handlers ---
export const refreshAgency = (req, res, next) => rotateToken(req, res, next, 'agency');
export const logoutAgency = (req, res, next) => revokeToken(req, res, next, 'agency');
export const meAgency = async (req, res) => {
  return sendSuccess(res, 200, 'Profile retrieved', {
    agencyUser: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      designation: req.user.designation,
      role: req.user.role,
    },
    agency: req.agency,
    agencyStatus: req.agency.status,
  });
};

export const updateProfileAgency = async (req, res, next) => {
  const { name, phone, designation, companyName, tradeName, officeAddress, websiteUrl, yearsInBusiness, iataNumber } = req.body;

  try {
    // 1. Update Agency User details
    if (name) req.user.name = name;
    if (phone) req.user.phone = phone;
    if (designation !== undefined) req.user.designation = designation;
    await req.user.save();

    // 2. Update Agency details
    if (companyName) req.agency.companyName = companyName;
    if (tradeName !== undefined) req.agency.tradeName = tradeName;
    if (websiteUrl !== undefined) req.agency.websiteUrl = websiteUrl;
    if (yearsInBusiness !== undefined) req.agency.yearsInBusiness = yearsInBusiness;
    if (iataNumber !== undefined) req.agency.iataNumber = iataNumber;

    if (officeAddress) {
      req.agency.officeAddress = {
        ...req.agency.officeAddress.toObject(),
        ...officeAddress,
      };
    }

    await req.agency.save();

    return sendSuccess(res, 200, 'Profile updated successfully', {
      agencyUser: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        designation: req.user.designation,
        role: req.user.role,
      },
      agency: req.agency,
      agencyStatus: req.agency.status,
    });
  } catch (error) {
    logger.error({ err: error }, 'Error updating Agency profile');
    return next(new AppError('Error updating profile information', 500));
  }
};

// --- Admin Handlers ---
/**
 * Handles the login authentication of an AdminUser.
 */
export const loginAdmin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const normalizedEmail = String(email).toLowerCase().trim();

    // Fetch AdminUser with passwordHash explicitly selected
    const admin = await AdminUser.findOne({ email: normalizedEmail }).select('+passwordHash');
    if (!admin) {
      return next(new AppError('Invalid credentials', 401));
    }

    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isPasswordValid) {
      return next(new AppError('Invalid credentials', 401));
    }

    if (!admin.isActive) {
      return next(new AppError('Forbidden: Admin account is inactive', 403));
    }

    // Generate JWT access token (15 minute expiration)
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
    const accessToken = jwt.sign(
      {
        sub: admin._id,
        scope: 'admin',
        role: admin.role,
      },
      jwtSecret,
      { expiresIn: '15m' }
    );

    // Generate raw refresh token, hash it using SHA-256, and store in database
    const rawRefreshToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashSha256(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await RefreshToken.create({
      userId: admin._id,
      scope: 'admin',
      tokenHash,
      expiresAt,
    });

    // Update last login timestamp
    admin.lastLoginAt = new Date();
    await admin.save();

    return sendSuccess(res, 200, 'Logged in successfully', {
      accessToken,
      refreshToken: rawRefreshToken,
      adminUser: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    logger.error({ err: error }, 'Unexpected error during Admin login');
    return next(new AppError('Internal server error during login', 500));
  }
};

export const refreshAdmin = (req, res, next) => rotateToken(req, res, next, 'admin');
export const logoutAdmin = (req, res, next) => revokeToken(req, res, next, 'admin');
export const meAdmin = async (req, res) => {
  return sendSuccess(res, 200, 'Profile retrieved', {
    adminUser: {
      id: req.admin._id,
      name: req.admin.name,
      email: req.admin.email,
      role: req.admin.role,
    },
  });
};
