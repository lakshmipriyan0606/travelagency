import * as analyticsService from "./analytics.service.js";

export const recordVisit = async (req, res) => {
  try {
    const result = await analyticsService.recordVisitService(req);
    if (result.skipped || result.duplicate) {
      return res.status(200).json({ message: result.message });
    }
    return res.status(201).json({ message: result.message });
  } catch (error) {
    console.error("Error recording visit:", error);
    const status = error.statusCode || 500;
    return res.status(status).json({ message: error.message || "Internal server error" });
  }
};

export const getDailyVisits = async (req, res) => {
  try {
    const data = await analyticsService.getDailyVisitsService();
    return res.status(200).json({ data });
  } catch (error) {
    console.error("Error fetching daily visits:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getApiUsage = async (req, res) => {
  try {
    const usage = await analyticsService.getApiUsageService();
    return res.status(200).json(usage);
  } catch (error) {
    console.error("Error fetching API usage:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const cleanupLocalhostVisits = async (req, res) => {
  try {
    const result = await analyticsService.cleanupLocalhostVisitsService();
    return res.status(200).json({
      message: "Localhost visits removed",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error cleaning localhost visits:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const runStartupLocalhostCleanup = analyticsService.runStartupLocalhostCleanupService;
