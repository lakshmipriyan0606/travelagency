/**
 * ============================================================================
 * Analytics Repository
 * ============================================================================
 *
 * Layer:
 * Data Access
 *
 * Responsibility:
 * Centralizes read/write and aggregation queries for both Visitors and API hits.
 *
 * Called By:
 * src/modules/analytics/analytics.service.js
 *
 * Depends On:
 * src/modules/analytics/visitor.model.js
 * src/modules/analytics/apiHit.model.js
 * ============================================================================
 */
import Visitor from './visitor.model.js';
import ApiHit from './apiHit.model.js';

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
