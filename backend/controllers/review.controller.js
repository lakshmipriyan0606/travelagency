import Review from "../models/Review.model.js";

export const createReview = async (req, res) => {
  try {
    const { name, content, profileImage, location, rating, status, orderNumber } = req.body;

    const review = new Review({
      name,
      content,
      profileImage,
      location,
      rating,
      status,
      orderNumber,
    });

    const savedReview = await review.save();
    return res.status(201).json(savedReview);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to create review" });
  }
};

export const getAllReviews = async (req, res) => {
  try {
    const { status } = req.query; // Admin can filter by status, public gets only "Published"
    const filter = status ? { status } : {};
    
    const reviews = await Review.find(filter).sort("orderNumber");
    return res.status(200).json(reviews);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to fetch reviews" });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedReview = await Review.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!updatedReview) {
      return res.status(404).json({ message: "Review not found" });
    }

    return res.status(200).json(updatedReview);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to update review" });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedReview = await Review.findByIdAndDelete(id);

    if (!deletedReview) {
      return res.status(404).json({ message: "Review not found" });
    }

    return res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to delete review" });
  }
};

/**
 * Easy Reordering: Swaps the orderNumber between two reviews.
 */
export const swapOrder = async (req, res) => {
  try {
    const { id1, id2 } = req.body;

    const review1 = await Review.findById(id1);
    const review2 = await Review.findById(id2);

    if (!review1 || !review2) {
      return res.status(404).json({ message: "One or both reviews not found" });
    }

    const tempOrder = review1.orderNumber;
    review1.orderNumber = review2.orderNumber;
    review2.orderNumber = tempOrder;

    await review1.save();
    await review2.save();

    return res.status(200).json({ message: "Order swapped successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to swap order" });
  }
};

/**
 * Move Up/Down helper: Swaps orderNumber with the review immediately above or below.
 * direction: "up" or "down"
 */
export const moveReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { direction } = req.body;

    const currentReview = await Review.findById(id);
    if (!currentReview) return res.status(404).json({ message: "Review not found" });

    let targetReview;
    if (direction === "up") {
      targetReview = await Review.findOne({ orderNumber: { $lt: currentReview.orderNumber } }).sort({ orderNumber: -1 });
    } else {
      targetReview = await Review.findOne({ orderNumber: { $gt: currentReview.orderNumber } }).sort({ orderNumber: 1 });
    }

    if (!targetReview) {
      return res.status(400).json({ message: `Cannot move review further ${direction}` });
    }

    const tempOrder = currentReview.orderNumber;
    currentReview.orderNumber = targetReview.orderNumber;
    targetReview.orderNumber = tempOrder;

    await currentReview.save();
    await targetReview.save();

    return res.status(200).json({ message: `Review moved ${direction} successfully` });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to move review" });
  }
};

/**
 * Normalizes all reviews' orderNumber to be sequential (1, 2, 3...)
 * to fix gaps like [566, 712].
 */
export const normalizeReviewsOrder = async (req, res) => {
  try {
    const reviews = await Review.find().sort("orderNumber");
    
    const updatePromises = reviews.map((review, index) => {
      review.orderNumber = index + 1;
      return review.save();
    });

    await Promise.all(updatePromises);

    return res.status(200).json({ message: "Review orders normalized successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to normalize review orders" });
  }
};
