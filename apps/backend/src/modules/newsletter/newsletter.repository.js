/**
 * ============================================================================
 * Newsletter Repository
 * ============================================================================
 *
 * Layer:
 * Data Access
 *
 * Responsibility:
 * Centralizes read/write access to the Newsletter collection.
 *
 * Called By:
 * src/modules/newsletter/newsletter.service.js
 *
 * Depends On:
 * src/modules/newsletter/newsletter.model.js
 * ============================================================================
 */
import Newsletter from './newsletter.model.js';

export const create = async (data) => {
  return await Newsletter.create(data);
};

export const findOne = async (query) => {
  return await Newsletter.findOne(query);
};

export const findSorted = async (query = {}, sort = { subscribedAt: -1 }) => {
  return await Newsletter.find(query).sort(sort);
};

export const deleteByEmail = async (email) => {
  return await Newsletter.findOneAndDelete({ email });
};
