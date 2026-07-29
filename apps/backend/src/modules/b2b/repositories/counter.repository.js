import Counter from '../models/counter.model.js';

/**
 * Atomically increments and returns the sequence number for a given key.
 * Supports passing Mongoose session options for transaction compliance.
 *
 * @param {string} key
 * @param {Object} options Mongoose execution options (e.g. session)
 * @returns {Promise<number>} Next sequence value
 */
export const getNextSequenceValue = async (key, options = {}) => {
  const result = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, ...options }
  ).lean();
  return result.seq;
};
