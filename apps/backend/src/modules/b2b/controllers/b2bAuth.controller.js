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
import { RefreshToken } from '../models/refreshToken.model.js';
import { AppError } from '#middleware/error/AppError.js';
import { sendSuccess } from '#utils/response.js';
import { notifyAgency } from '../services/notifications.service.js';
import { logger } from '#shared/logger.js';

// Centralized security configurations
const BCRYPT_SALT_ROUNDS = 12;

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
      return next(new AppError('Email already registered', 409));
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
      case 'rejected':
        return next(
          new AppError(
            `Your account was rejected: ${agency.rejectionReason || 'No reason specified'}`,
            403
          )
        );
      case 'suspended':
        return next(new AppError('Your account has been suspended', 403));
      case 'active':
        break; // proceed
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
    const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
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
