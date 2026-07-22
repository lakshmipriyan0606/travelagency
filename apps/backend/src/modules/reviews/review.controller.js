import * as reviewService from "./review.service.js";

export const createReview = async (req, res) => {
  try {
    const savedReview = await reviewService.createReviewService(req.body);
    return res.status(201).json(savedReview);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to create review" });
  }
};

export const getAllReviews = async (req, res) => {
  try {
    const { status } = req.query;
    const reviews = await reviewService.getAllReviewsService(status);
    return res.status(200).json(reviews);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to fetch reviews" });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedReview = await reviewService.updateReviewService(id, req.body);
    return res.status(200).json(updatedReview);
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ message: error.message || "Failed to update review" });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    await reviewService.deleteReviewService(id);
    return res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ message: error.message || "Failed to delete review" });
  }
};

export const swapOrder = async (req, res) => {
  try {
    const { id1, id2 } = req.body;
    const result = await reviewService.swapOrderService(id1, id2);
    return res.status(200).json(result);
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ message: error.message || "Failed to swap order" });
  }
};

export const moveReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { direction } = req.body;
    const result = await reviewService.moveReviewService(id, direction);
    return res.status(200).json(result);
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ message: error.message || "Failed to move review" });
  }
};

export const normalizeReviewsOrder = async (req, res) => {
  try {
    const result = await reviewService.normalizeReviewsOrderService();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to normalize review orders" });
  }
};
