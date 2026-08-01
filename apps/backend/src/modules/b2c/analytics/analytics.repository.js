/**
 * ============================================================================
 * Analytics Repository
 * ============================================================================
 *
 * Layer:
 * Data Access
 *
 * Responsibility:
 * Centralizes Visitor read/write/aggregation. ApiHit delete helpers remain for
 * startup cleanup; DevOps aggregates ApiHit directly via the model.
 *
 * Called By:
 * src/modules/b2c/analytics/analytics.service.js
 *
 * Depends On:
 * src/modules/b2c/analytics/visitor.model.js
 * src/modules/b2c/analytics/apiHit.model.js
 * ============================================================================
 */
import Visitor from './visitor.model.js';
import ApiHit from './apiHit.model.js';

export const createVisitor = async (data) => {
  return await Visitor.create(data);
};

export const findVisitorByDay = async (visitorId, date) => {
  return await Visitor.findOne({ visitorId, date });
};

export const updateVisitorById = async (id, update, options = {}) => {
  return await Visitor.findByIdAndUpdate(id, update, {
    new: true,
    ...options,
  });
};

export const findVisitorById = async (visitorId, date) => {
  const filter = { visitorId };
  if (date) filter.date = date;
  return await Visitor.findOne(filter).sort({ lastVisit: -1, createdAt: -1 }).lean();
};

export const findRecentVisitors = async ({
  filter,
  skip = 0,
  limit = 10,
  sort = { lastVisit: -1 },
}) => {
  // One passport (visitorId) = one row. Same user returning on other days is not duplicated.
  const pipeline = [
    { $match: filter },
    { $sort: { lastVisit: -1, createdAt: -1 } },
    {
      $group: {
        _id: '$visitorId',
        doc: { $first: '$$ROOT' },
        daysSeen: { $sum: 1 },
        lifetimeVisitCount: { $sum: { $ifNull: ['$visitCount', 1] } },
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [
            '$doc',
            {
              daysSeen: '$daysSeen',
              lifetimeVisitCount: '$lifetimeVisitCount',
            },
          ],
        },
      },
    },
    { $sort: sort },
    {
      $facet: {
        items: [{ $skip: skip }, { $limit: limit }],
        total: [{ $count: 'n' }],
      },
    },
  ];

  const [result] = await Visitor.aggregate(pipeline).allowDiskUse(true);
  return {
    items: result?.items || [],
    total: result?.total?.[0]?.n || 0,
  };
};

export const aggregateVisitors = async (pipeline) => {
  return await Visitor.aggregate(pipeline).allowDiskUse(true);
};

export const deleteVisitorMany = async (filter) => {
  return await Visitor.deleteMany(filter);
};

export const deleteApiHitMany = async (filter) => {
  return await ApiHit.deleteMany(filter);
};
