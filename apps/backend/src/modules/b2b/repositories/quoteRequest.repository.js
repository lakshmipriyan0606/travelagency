import QuoteRequest from '../models/quoteRequest.model.js';

export const create = async (quoteData, options = {}) => {
  const quote = new QuoteRequest(quoteData);
  return await quote.save(options);
};

export const findById = async (id, options = {}) => {
  return await QuoteRequest.findById(id, null, options).populate('agencyId').lean();
};

export const findByReference = async (reference, options = {}) => {
  return await QuoteRequest.findOne({ reference }, null, options).populate('agencyId').lean();
};

export const findSorted = async (filter = {}, sort = { createdAt: -1 }, page = 1, pageSize = 10, options = {}) => {
  const skip = (page - 1) * pageSize;
  const [data, total] = await Promise.all([
    QuoteRequest.find(filter, null, options)
      .sort(sort)
      .skip(skip)
      .limit(pageSize)
      .lean(),
    QuoteRequest.countDocuments(filter, options),
  ]);
  return { data, total };
};

export const findOneAndUpdate = async (query, update, options = { new: true }) => {
  return await QuoteRequest.findOneAndUpdate(query, update, options);
};

export const countDocuments = async (filter = {}, options = {}) => {
  return await QuoteRequest.countDocuments(filter, options);
};

export const aggregate = async (pipeline, options = {}) => {
  return await QuoteRequest.aggregate(pipeline, options);
};
