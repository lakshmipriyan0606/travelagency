import Review from "./review.model.js";

export const create = async (reviewData) => {
  const review = new Review(reviewData);
  return await review.save();
};

export const find = async (filter = {}, sort = "orderNumber") => {
  return await Review.find(filter).sort(sort);
};

export const findById = async (id) => {
  return await Review.findById(id);
};

export const findOne = async (query, sortOptions = {}) => {
  return await Review.findOne(query).sort(sortOptions);
};

export const updateById = async (id, updateData) => {
  return await Review.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteById = async (id) => {
  return await Review.findByIdAndDelete(id);
};

export const saveDocument = async (doc) => {
  return await doc.save();
};
