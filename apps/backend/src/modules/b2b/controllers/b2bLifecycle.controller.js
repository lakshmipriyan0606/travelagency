import { Agency } from '../models/agency.model.js';
import { AgencyUser } from '../models/agencyUser.model.js';
import { AgencyStatusLog } from '../models/agencyStatusLog.model.js';
import { RefreshToken } from '../models/refreshToken.model.js';
import { AppError } from '#shared/errors/AppError.js';
import { sendSuccess } from '#shared/utils/response.js';
import { notifyAgency } from '../services/notifications.service.js';
import { logger } from '#shared/utils/logger.js';

/**
 * Shared helper to coordinate B2B Agency status transitions.
 * Ensures transitions comply with business rules, updates the Agency,
 * logs the transition in AgencyStatusLog, and triggers B2B notifications.
 *
 * Status constraints:
 * - Approve: 'pending' -> 'active'
 * - Reject: 'pending' -> 'rejected'
 * - Suspend: 'active' -> 'suspended'
 * - Reactivate: 'suspended' -> 'active'
 *
 * @param {string} agencyId - Mongoose Agency ID
 * @param {string} toStatus - The status to transition into
 * @param {string} adminId - Mongoose ID of the actioning AdminUser
 * @param {string} [reason] - Optional reason for rejection / suspension
 * @param {string} action - The transition action name (approve, reject, suspend, reactivate)
 */
const changeAgencyStatus = async (agencyId, toStatus, adminId, reason = '', action) => {
  const agency = await Agency.findById(agencyId);
  if (!agency || agency.isDeleted) {
    throw new AppError('Agency not found', 404);
  }

  const fromStatus = agency.status;

  // Validate allowed status transitions
  let isValid = false;
  if (action === 'approve' && toStatus === 'active' && fromStatus === 'pending') isValid = true;
  if (action === 'reject' && toStatus === 'rejected' && fromStatus === 'pending') isValid = true;
  if (action === 'suspend' && toStatus === 'suspended' && fromStatus === 'active') isValid = true;
  if (action === 'reactivate' && toStatus === 'active' && fromStatus === 'suspended')
    isValid = true;

  if (!isValid) {
    throw new AppError(
      `Conflict: Cannot transition agency status from '${fromStatus}' to '${toStatus}'`,
      409
    );
  }

  // Update Agency document fields
  agency.status = toStatus;
  agency.statusChangedAt = new Date();

  if (toStatus === 'active' && fromStatus === 'pending') {
    agency.approvedBy = adminId;
    agency.approvedAt = new Date();
  }

  if (toStatus === 'rejected') {
    agency.rejectionReason = reason;
  }

  await agency.save();

  // Log transition in status history
  await AgencyStatusLog.create({
    agencyId,
    fromStatus,
    toStatus,
    changedBy: adminId,
    reason,
  });

  // Call the notifications service stub
  try {
    let notifyType = toStatus;
    if (toStatus === 'active' && fromStatus === 'suspended') {
      notifyType = 'reactivated';
    } else if (toStatus === 'active' && fromStatus === 'pending') {
      notifyType = 'approved';
    }
    await notifyAgency(agency, notifyType, reason);
  } catch (notifyErr) {
    logger.warn({ err: notifyErr }, 'B2B status update notification failed');
  }

  return agency;
};

/**
 * GET /api/b2b/admin/agencies
 * Fetch list of B2B agencies filtered by status.
 */
export const getAgencies = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) {
      filter.status = status;
    }
    const agencies = await Agency.find(filter).sort({ createdAt: -1 });
    return sendSuccess(res, 200, 'Agencies fetched successfully', { data: agencies });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/b2b/admin/agencies/:id/approve
 * Approves a pending agency.
 */
export const approveAgency = async (req, res, next) => {
  try {
    const agency = await changeAgencyStatus(req.params.id, 'active', req.admin._id, '', 'approve');
    return sendSuccess(res, 200, 'Agency approved successfully', { data: agency });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/b2b/admin/agencies/:id/reject
 * Rejects a pending agency. Requires reason.
 */
export const rejectAgency = async (req, res, next) => {
  const { reason } = req.body;
  if (!reason || reason.trim() === '') {
    return next(new AppError('Rejection reason is required', 400));
  }

  try {
    const agency = await changeAgencyStatus(
      req.params.id,
      'rejected',
      req.admin._id,
      reason,
      'reject'
    );
    return sendSuccess(res, 200, 'Agency rejected successfully', { data: agency });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/b2b/admin/agencies/:id/suspend
 * Suspends an active agency and revokes all refresh tokens of its users.
 */
export const suspendAgency = async (req, res, next) => {
  const { reason } = req.body;
  if (!reason || reason.trim() === '') {
    return next(new AppError('Suspension reason is required', 400));
  }

  try {
    // Perform status transition and log creation
    const agency = await changeAgencyStatus(
      req.params.id,
      'suspended',
      req.admin._id,
      reason,
      'suspend'
    );

    // Revoke all refresh tokens for users belonging to this agency
    const users = await AgencyUser.find({ agencyId: agency._id }, '_id');
    const userIds = users.map((u) => u._id);

    if (userIds.length > 0) {
      await RefreshToken.updateMany({ userId: { $in: userIds } }, { revoked: true });
      logger.info(
        { agencyId: agency._id, userCount: userIds.length },
        'Revoked all active refresh tokens for suspended agency users'
      );
    }

    return sendSuccess(res, 200, 'Agency suspended successfully', { data: agency });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/b2b/admin/agencies/:id/reactivate
 * Reactivates a suspended agency.
 */
export const reactivateAgency = async (req, res, next) => {
  try {
    const agency = await changeAgencyStatus(
      req.params.id,
      'active',
      req.admin._id,
      '',
      'reactivate'
    );
    return sendSuccess(res, 200, 'Agency reactivated successfully', { data: agency });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/b2b/admin/agencies/:id/status-log
 * Retrieves status transition logs for a given agency.
 */
export const getStatusLog = async (req, res, next) => {
  try {
    const logs = await AgencyStatusLog.find({ agencyId: req.params.id })
      .populate('changedBy', 'name email')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Agency status log fetched successfully', { data: logs });
  } catch (error) {
    next(error);
  }
};
