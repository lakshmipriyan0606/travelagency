/**
 * ============================================================================
 * Package Controller
 * ============================================================================
 *
 * Layer:
 * Controller / Interface Adapter
 *
 * Responsibility:
 * Processes HTTP requests related to packages and activities. Orchestrates
 * payload parsing, validation, and invoking the package business service.
 *
 * Called By:
 * src/modules/packages/package.b2c.routes.js
 * src/modules/packages/package.admin.routes.js
 *
 * Depends On:
 * src/modules/packages/package.service.js
 * ============================================================================
 */
import * as packageService from './package.service.js';
import { sendSuccess } from '#utils/response.js';

export const createPackage = async (req, res, next) => {
  try {
    const pkg = await packageService.createPackageService(req.body, req.files, req.user?._id);
    return sendSuccess(res, 201, 'Package created successfully', { data: pkg });
  } catch (error) {
    next(error);
  }
};

export const updatePackage = async (req, res, next) => {
  try {
    const pkg = await packageService.updatePackageService(req.params.id, req.body, req.files);
    return sendSuccess(res, 200, 'Package updated successfully', { data: pkg });
  } catch (error) {
    next(error);
  }
};

export const getBestPackages = async (req, res, next) => {
  try {
    const userId = req?.headers?.userid;
    const data = await packageService.getBestPackages(userId);
    return sendSuccess(res, 200, 'All best packages fetched successfully', { data });
  } catch (error) {
    next(error);
  }
};

export const getBestActivities = async (req, res, next) => {
  try {
    const userId = req?.headers?.userid;
    const data = await packageService.getBestActivities(userId);
    return sendSuccess(res, 200, 'All best activities fetched successfully', { data });
  } catch (error) {
    next(error);
  }
};

export const getAllPackages = async (req, res, next) => {
  try {
    const userId = req?.headers?.userid;
    const result = await packageService.listPackages(req.query, userId);
    return sendSuccess(res, 200, 'Packages fetched successfully', result);
  } catch (error) {
    next(error);
  }
};

export const getActivityCategories = async (req, res, next) => {
  try {
    const data = await packageService.getActivityCategories();
    return sendSuccess(res, 200, 'Activity categories fetched successfully', { data });
  } catch (error) {
    next(error);
  }
};

export const getLikedPackages = async (req, res, next) => {
  try {
    const userId = req?.headers?.userid;
    const result = await packageService.getLikedPackages(userId, req.query);
    return sendSuccess(res, 200, result.message || 'Liked packages fetched successfully', result);
  } catch (error) {
    next(error);
  }
};

export const getLikeCount = async (req, res, next) => {
  try {
    const userId = req?.headers?.userid;
    const count = await packageService.getLikeCount(userId);
    return sendSuccess(res, 200, 'like count fetched successfully', { data: count });
  } catch (error) {
    next(error);
  }
};

export const getSuggestions = async (req, res, next) => {
  try {
    const result = await packageService.getSuggestions(req.query.q);
    return sendSuccess(res, 200, 'Suggestions fetched successfully', result);
  } catch (error) {
    next(error);
  }
};

export const getTakenRanks = async (req, res, next) => {
  try {
    const takenRanks = await packageService.getTakenRanks();
    return sendSuccess(res, 200, 'Taken ranks fetched', { takenRanks });
  } catch (error) {
    next(error);
  }
};

export const getPackageById = async (req, res, next) => {
  try {
    const data = await packageService.getPackageById(req.params.id);
    return sendSuccess(res, 200, 'Package fetched successfully', { data });
  } catch (error) {
    next(error);
  }
};

export const updateRank = async (req, res, next) => {
  try {
    const result = await packageService.updateRank(req.params.id, req.body.bestRank);
    return sendSuccess(res, 200, 'Rank updated successfully', result);
  } catch (error) {
    next(error);
  }
};

export const toggleStatus = async (req, res, next) => {
  try {
    const result = await packageService.toggleStatus(req.params.id);
    return sendSuccess(res, 200, 'Status toggled successfully', result);
  } catch (error) {
    next(error);
  }
};

export const deletePackage = async (req, res, next) => {
  try {
    const deletedPackage = await packageService.deletePackage(req.params.id);
    return sendSuccess(res, 200, 'Package deleted successfully', { deletedPackage });
  } catch (error) {
    next(error);
  }
};

export const toggleLike = async (req, res, next) => {
  try {
    const { userId, id, liked } = req.body;
    const updatedLikes = await packageService.toggleLike(userId, id, liked);
    return sendSuccess(res, 200, 'Updated', { likes: updatedLikes });
  } catch (error) {
    next(error);
  }
};

export const syncFromSheet = async (req, res, next) => {
  try {
    const result = await packageService.syncFromSheetService();
    return sendSuccess(res, 200, `Synced ${result.count} packages from sheet`, { success: true });
  } catch (error) {
    next(error);
  }
};
