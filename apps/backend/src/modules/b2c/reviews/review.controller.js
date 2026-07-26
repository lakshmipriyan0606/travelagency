/**
 * ============================================================================
 * Review Controller
 * ============================================================================
 *
 * Layer:
 * Controller / Interface Adapter
 *
 * Responsibility:
 * Processes HTTP requests to manage and fetch customer reviews.
 *
 * Called By:
 * src/modules/reviews/review.b2c.routes.js
 * src/modules/reviews/review.admin.routes.js
 *
 * Depends On:
 * src/modules/reviews/review.service.js
 * ============================================================================
 */
import * as reviewService from './review.service.js';
import { sendSuccess } from '#shared/utils/response.js';

export const createReview = async (req, res, next) => {
  try {
    const savedReview = await reviewService.createReviewService(req.body);
    return sendSuccess(res, 201, 'Review created successfully', savedReview);
  } catch (error) {
    next(error);
  }
};

export const getAllReviews = async (req, res, next) => {
  try {
    const { status } = req.query;
    const reviews = await reviewService.getAllReviewsService(status);
    return sendSuccess(res, 200, 'Reviews fetched successfully', reviews);
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedReview = await reviewService.updateReviewService(id, req.body);
    return sendSuccess(res, 200, 'Review updated successfully', updatedReview);
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    await reviewService.deleteReviewService(id);
    return sendSuccess(res, 200, 'Review deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const swapOrder = async (req, res, next) => {
  try {
    const { id1, id2 } = req.body;
    const result = await reviewService.swapOrderService(id1, id2);
    return sendSuccess(res, 200, 'Order swapped successfully', result);
  } catch (error) {
    next(error);
  }
};

export const moveReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { direction } = req.body;
    const result = await reviewService.moveReviewService(id, direction);
    return sendSuccess(res, 200, 'Review moved successfully', result);
  } catch (error) {
    next(error);
  }
};

export const normalizeReviewsOrder = async (req, res, next) => {
  try {
    const result = await reviewService.normalizeReviewsOrderService();
    return sendSuccess(res, 200, 'Review orders normalized successfully', result);
  } catch (error) {
    next(error);
  }
};
