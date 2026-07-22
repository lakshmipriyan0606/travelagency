import * as reviewRepository from "./review.repository.js";

export const createReviewService = async (body) => {
  return await reviewRepository.create(body);
};

export const getAllReviewsService = async (status) => {
  const filter = status ? { status } : {};
  return await reviewRepository.find(filter, "orderNumber");
};

export const updateReviewService = async (id, updateData) => {
  const updated = await reviewRepository.updateById(id, updateData);
  if (!updated) {
    const error = new Error("Review not found");
    error.statusCode = 404;
    throw error;
  }
  return updated;
};

export const deleteReviewService = async (id) => {
  const deleted = await reviewRepository.deleteById(id);
  if (!deleted) {
    const error = new Error("Review not found");
    error.statusCode = 404;
    throw error;
  }
  return deleted;
};

export const swapOrderService = async (id1, id2) => {
  const review1 = await reviewRepository.findById(id1);
  const review2 = await reviewRepository.findById(id2);

  if (!review1 || !review2) {
    const error = new Error("One or both reviews not found");
    error.statusCode = 404;
    throw error;
  }

  const tempOrder = review1.orderNumber;
  review1.orderNumber = review2.orderNumber;
  review2.orderNumber = tempOrder;

  await reviewRepository.saveDocument(review1);
  await reviewRepository.saveDocument(review2);

  return { message: "Order swapped successfully" };
};

export const moveReviewService = async (id, direction) => {
  const currentReview = await reviewRepository.findById(id);
  if (!currentReview) {
    const error = new Error("Review not found");
    error.statusCode = 404;
    throw error;
  }

  let targetReview;
  if (direction === "up") {
    targetReview = await reviewRepository.findOne(
      { orderNumber: { $lt: currentReview.orderNumber } },
      { orderNumber: -1 }
    );
  } else {
    targetReview = await reviewRepository.findOne(
      { orderNumber: { $gt: currentReview.orderNumber } },
      { orderNumber: 1 }
    );
  }

  if (!targetReview) {
    const error = new Error(`Cannot move review further ${direction}`);
    error.statusCode = 400;
    throw error;
  }

  const tempOrder = currentReview.orderNumber;
  currentReview.orderNumber = targetReview.orderNumber;
  targetReview.orderNumber = tempOrder;

  await reviewRepository.saveDocument(currentReview);
  await reviewRepository.saveDocument(targetReview);

  return { message: `Review moved ${direction} successfully` };
};

export const normalizeReviewsOrderService = async () => {
  const reviews = await reviewRepository.find({}, "orderNumber");
  const updatePromises = reviews.map((review, index) => {
    review.orderNumber = index + 1;
    return reviewRepository.saveDocument(review);
  });
  await Promise.all(updatePromises);
  return { message: "Review orders normalized successfully" };
};
