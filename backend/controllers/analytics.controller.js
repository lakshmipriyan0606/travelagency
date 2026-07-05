import Visitor from "../models/Visitor.model.js";
import ApiHit from "../models/ApiHit.model.js";
import {
  getClientIp,
  getUtcDateString,
  isLocalRequest,
  maskIp,
  EXCLUDE_ANALYTICS_ROUTE,
} from "../utils/requestOrigin.js";

const LOCALHOST_IP_MATCH = {
  $or: [
    { ip: { $regex: /localhost|127\.0\.0\.1|::1/i } },
    { ip: { $regex: /^::ffff:127\./ } },
    { ip: { $regex: /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/ } },
    { ip: { $regex: /^192\.168\.\d{1,3}\.\d{1,3}$/ } },
    { ip: { $regex: /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/ } },
  ],
};

export const recordVisit = async (req, res) => {
  try {
    const { visitorId, referrer, path } = req.body;
    if (!visitorId) return res.status(400).json({ message: "visitorId is required" });

    if (isLocalRequest(req)) {
      return res.status(200).json({ message: "Local visit skipped" });
    }

    const date = getUtcDateString();
    const userAgent = req.headers["user-agent"] || "Unknown";
    const ip = getClientIp(req);

    try {
      await Visitor.create({
        visitorId,
        date,
        userAgent,
        ip,
        referrer: referrer || "",
        path: path || "",
      });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(200).json({ message: "Visit already recorded for today" });
      }
      throw err;
    }

    res.status(201).json({ message: "Visit recorded successfully" });
  } catch (error) {
    console.error("Error recording visit:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getDailyVisits = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateLimit = getUtcDateString(thirtyDaysAgo);

    const visits = await Visitor.aggregate([
      {
        $match: {
          date: { $gte: dateLimit },
          $nor: [LOCALHOST_IP_MATCH],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$date",
          count: { $sum: 1 },
          details: {
            $push: {
              userAgent: "$userAgent",
              ip: "$ip",
              referrer: "$referrer",
              path: "$path",
              time: "$createdAt",
            },
          },
        },
      },
      {
        $project: {
          count: 1,
          details: {
            $map: {
              input: { $slice: ["$details", 10] },
              as: "d",
              in: {
                userAgent: "$$d.userAgent",
                ip: "$$d.ip",
                referrer: "$$d.referrer",
                path: "$$d.path",
                time: "$$d.time",
              },
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const data = visits.map((day) => ({
      ...day,
      details: day.details.map((d) => ({
        ...d,
        ip: maskIp(d.ip),
      })),
    }));

    res.status(200).json({ data });
  } catch (error) {
    console.error("Error fetching daily visits:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getApiUsage = async (req, res) => {
  try {
    const today = getUtcDateString();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateLimit = getUtcDateString(thirtyDaysAgo);

    const [todayTotalResult, dailyStats, topRoutes, routeDetails] = await Promise.all([
      ApiHit.aggregate([
        { $match: { date: today, ...EXCLUDE_ANALYTICS_ROUTE } },
        { $group: { _id: null, total: { $sum: "$count" } } },
      ]),
      ApiHit.aggregate([
        { $match: { date: { $gte: dateLimit }, ...EXCLUDE_ANALYTICS_ROUTE } },
        { $group: { _id: "$date", count: { $sum: "$count" } } },
        { $sort: { _id: 1 } },
      ]),
      ApiHit.aggregate([
        { $match: { date: { $gte: dateLimit }, ...EXCLUDE_ANALYTICS_ROUTE } },
        {
          $group: {
            _id: { method: "$method", route: "$route" },
            count: { $sum: "$count" },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
          $project: {
            _id: 0,
            route: { $concat: ["$_id.method", " ", "$_id.route"] },
            method: "$_id.method",
            path: "$_id.route",
            count: 1,
          },
        },
      ]),
      ApiHit.aggregate([
        { $match: { date: { $gte: dateLimit }, ...EXCLUDE_ANALYTICS_ROUTE } },
        {
          $group: {
            _id: { method: "$method", route: "$route", status: "$status" },
            count: { $sum: "$count" },
          },
        },
        { $sort: { count: -1 } },
        {
          $group: {
            _id: { method: "$_id.method", route: "$_id.route" },
            total: { $sum: "$count" },
            statuses: {
              $push: { status: "$_id.status", count: "$count" },
            },
          },
        },
        { $sort: { total: -1 } },
        { $limit: 20 },
        {
          $project: {
            _id: 0,
            route: { $concat: ["$_id.method", " ", "$_id.route"] },
            method: "$_id.method",
            path: "$_id.route",
            total: 1,
            statuses: 1,
          },
        },
      ]),
    ]);

    res.status(200).json({
      todayTotal: todayTotalResult[0]?.total || 0,
      dailyStats,
      topRoutes,
      routeDetails,
    });
  } catch (error) {
    console.error("Error fetching API usage:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const cleanupLocalhostVisits = async (req, res) => {
  try {
    const result = await Visitor.deleteMany(LOCALHOST_IP_MATCH);
    res.status(200).json({
      message: "Localhost visits removed",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error cleaning localhost visits:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export async function runStartupLocalhostCleanup() {
  try {
    const [visitorResult, apiHitResult] = await Promise.all([
      Visitor.deleteMany(LOCALHOST_IP_MATCH),
      ApiHit.deleteMany({ route: { $regex: "^/api/analytics" } }),
    ]);
    if (visitorResult.deletedCount > 0) {
      console.log(`Removed ${visitorResult.deletedCount} localhost visitor record(s)`);
    }
    if (apiHitResult.deletedCount > 0) {
      console.log(`Removed ${apiHitResult.deletedCount} analytics API hit record(s)`);
    }
  } catch (error) {
    console.error("Startup cleanup failed:", error.message);
  }
}
