import mongoose from "mongoose";

const VisitorSchema = new mongoose.Schema({
  visitorId: { type: String, required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  userAgent: { type: String },
  ip: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Ensure a user is only counted once per day
VisitorSchema.index({ visitorId: 1, date: 1 }, { unique: true });

export default mongoose.model("Visitor", VisitorSchema);
