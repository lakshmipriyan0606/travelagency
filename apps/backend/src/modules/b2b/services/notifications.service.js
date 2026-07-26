import { logger } from '#shared/utils/logger.js';

/**
 * Stub service for notifying B2B agencies regarding lifecycle changes.
 * Under production environments, this will hook into email / SMS APIs.
 *
 * @param {Object} agency - The Agency Mongoose document
 * @param {string} type - Notification type ('registered' | 'approved' | 'rejected' | 'suspended' | 'reactivated')
 * @param {string} [reason] - Optional reason for rejection or suspension
 * @returns {Promise<void>}
 */
export const notifyAgency = async (agency, type, reason = '') => {
  logger.info(
    { agencyId: agency._id, companyName: agency.companyName, type, reason },
    `[Notification Stub] Agency notified of status update: ${type}`
  );
};
