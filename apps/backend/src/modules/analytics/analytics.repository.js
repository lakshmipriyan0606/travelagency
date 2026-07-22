import Visitor from "./visitor.model.js";
import ApiHit from "./apiHit.model.js";

export const createVisitor = async (data) => {
  return await Visitor.create(data);
};

export const aggregateVisitors = async (pipeline) => {
  return await Visitor.aggregate(pipeline);
};

export const aggregateApiHits = async (pipeline) => {
  return await ApiHit.aggregate(pipeline);
};

export const deleteVisitorMany = async (filter) => {
  return await Visitor.deleteMany(filter);
};

export const deleteApiHitMany = async (filter) => {
  return await ApiHit.deleteMany(filter);
};
