import { Destination } from './destination.model.js';

export const count = async () => {
  return await Destination.countDocuments();
};

export const findAllSorted = async () => {
  return await Destination.find().sort('orderNumber');
};

export const findById = async (id) => {
  return await Destination.findById(id).lean();
};

export const findOne = async (query, sortOptions = {}) => {
  return await Destination.findOne(query).sort(sortOptions).lean();
};

export const create = async (destinationData) => {
  const destination = new Destination(destinationData);
  return await destination.save();
};

export const updateById = async (id, updateData) => {
  return await Destination.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteById = async (id) => {
  return await Destination.findByIdAndDelete(id);
};

export const saveDocument = async (doc) => {
  return await doc.save();
};
