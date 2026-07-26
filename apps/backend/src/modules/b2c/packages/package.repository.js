/**
 * ============================================================================
 * Package Repository
 * ============================================================================
 *
 * Layer:
 * Data Access
 *
 * Responsibility:
 * Encapsulates all interactions with the Package MongoDB collection.
 * Isolates the ORM (Mongoose) from the business service layer.
 *
 * Called By:
 * src/modules/packages/package.service.js
 *
 * Depends On:
 * src/modules/packages/package.model.js
 * ============================================================================
 */
import Package from './package.model.js';

/**
 * Creates a new package document.
 *
 * @param {Object} packageData
 * @returns {Promise<Object>} The saved Mongoose document
 */
export const create = async (packageData, options = {}) => {
  const pkg = new Package(packageData);
  return await pkg.save(options);
};

/**
 * Finds a package by ID.
 * lean() is used to return a plain JS object, saving memory since we only read.
 *
 * @param {string} id
 * @returns {Promise<Object>}
 */
export const findById = async (id, options = {}) => {
  const query = Package.findById(id);
  if (options.session) query.session(options.session);
  return options.lean === false ? await query : await query.lean();
};

/**
 * Finds a single package matching a query.
 * lean() is used for read-only performance optimization.
 *
 * @param {Object} query
 * @returns {Promise<Object>}
 */
export const findOne = async (query, options = {}) => {
  const q = Package.findOne(query);
  if (options.session) q.session(options.session);
  return options.lean === false ? await q : await q.lean();
};

/**
 * Finds multiple packages matching a query.
 * lean() is used for memory efficiency when returning lists.
 *
 * @param {Object} query
 * @param {Object} projection
 * @param {Object} options (e.g. limit, sort)
 * @returns {Promise<Array>}
 */
export const find = async (query, projection = null, options = {}) => {
  return await Package.find(query, projection, options).lean();
};

/**
 * Counts packages matching a query.
 * Used heavily for pagination totals.
 *
 * @param {Object} query
 * @returns {Promise<number>}
 */
export const countDocuments = async (query) => {
  return await Package.countDocuments(query);
};

/**
 * Gets distinct values for a field.
 * Used for dynamic category dropdowns in the UI.
 *
 * @param {string} field
 * @param {Object} query
 * @returns {Promise<Array>}
 */
export const distinct = async (field, query) => {
  return await Package.distinct(field, query);
};

/**
 * Updates a package by ID.
 *
 * @param {string} id
 * @param {Object} update
 * @param {Object} options
 * @returns {Promise<Object>}
 */
export const findByIdAndUpdate = async (id, update, options = {}) => {
  return await Package.findByIdAndUpdate(id, update, options);
};

/**
 * Updates a single package matching a query.
 *
 * @param {Object} query
 * @param {Object} update
 * @param {Object} options
 * @returns {Promise<Object>}
 */
export const findOneAndUpdate = async (query, update, options = {}) => {
  return await Package.findOneAndUpdate(query, update, options);
};
