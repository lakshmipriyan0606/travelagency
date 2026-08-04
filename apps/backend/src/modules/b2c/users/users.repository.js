/**
 * ============================================================================
 * Users Repository
 * ============================================================================
 *
 * Layer:
 * Data Access
 *
 * Responsibility:
 * Encapsulates MongoDB database interactions for the User collection.
 * Automatically filters out soft-deleted users in read operations.
 * Also automatically excludes sensitive password hashes from results.
 *
 * Called By:
 * src/modules/users/users.service.js
 *
 * Depends On:
 * src/modules/users/user.model.js
 * ============================================================================
 */
import User from './user.model.js';

export const findById = async (userId) => {
  return await User.findOne({ _id: userId, isDeleted: { $ne: true } })
    .select('-password')
    .lean();
};

export const findByEmail = async (email) => {
  const normalizedEmail = String(email || '').trim();
  return await User.findOne({
    email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') },
    isDeleted: { $ne: true },
  }).lean();
};

export const findAll = async (query = {}, options = {}) => {
  const { page = 1, limit = 20, search = '', role, status } = options;
  const filter = { ...query, isDeleted: false };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  if (role) filter.role = role;
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(filter).select('-password').skip(skip).limit(limit).sort({ createdAt: -1 }),
    User.countDocuments(filter),
  ]);

  return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const create = async (userData) => {
  return await User.create(userData);
};

export const updateById = async (userId, updateData) => {
  return await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true }).select(
    '-password'
  );
};

export const softDelete = async (userId) => {
  return await User.findByIdAndUpdate(userId, { $set: { isDeleted: true } }, { new: true });
};
