import Package from './package.model.js';

export const create = async (packageData) => {
  const pkg = new Package(packageData);
  return await pkg.save();
};

export const findById = async (id) => {
  return await Package.findById(id).lean();
};

export const findOne = async (query) => {
  return await Package.findOne(query).lean();
};

export const find = async (query, projection = null, options = {}) => {
  return await Package.find(query, projection, options).lean();
};

export const countDocuments = async (query) => {
  return await Package.countDocuments(query);
};

export const distinct = async (field, query) => {
  return await Package.distinct(field, query);
};

export const findByIdAndUpdate = async (id, update, options = {}) => {
  return await Package.findByIdAndUpdate(id, update, options);
};

export const findOneAndUpdate = async (query, update, options = {}) => {
  return await Package.findOneAndUpdate(query, update, options);
};
