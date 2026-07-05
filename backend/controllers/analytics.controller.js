import Visitor from "../models/Visitor.model.js";

export const recordVisit = async (req, res) => {
  try {
    const { visitorId } = req.body;
    if (!visitorId) return res.status(400).json({ message: "visitorId is required" });

    const date = new Date().toISOString().split("T")[0];
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ip = req.ip || req.connection.remoteAddress || 'Unknown';

    try {
      await Visitor.create({ visitorId, date, userAgent, ip });
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
    const dateLimit = thirtyDaysAgo.toISOString().split("T")[0];

    const visits = await Visitor.aggregate([
      { $match: { date: { $gte: dateLimit } } },
      { $sort: { createdAt: -1 } }, // Sort by newest first
      { $group: { 
          _id: "$date", 
          count: { $sum: 1 },
          details: { 
            $push: { 
              userAgent: "$userAgent", 
              time: "$createdAt" 
            } 
          }
      }},
      { $project: {
          count: 1,
          details: { $slice: ["$details", 10] } // Return only 10 most recent visitors per day to avoid huge payloads
      }},
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({ data: visits });
  } catch (error) {
    console.error("Error fetching daily visits:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
