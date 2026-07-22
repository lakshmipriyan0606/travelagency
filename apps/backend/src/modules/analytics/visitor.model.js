import mongoose from "mongoose";

const VisitorSchema = new mongoose.Schema({
  visitorId: { type: String, required: true },
  date: { type: String, required: true },
  userAgent: { type: String },
  ip: { type: String },
  referrer: { type: String },
  path: { type: String },
  createdAt: { type: Date, default: Date.now }
});

VisitorSchema.index({ visitorId: 1, date: 1 }, { unique: true });

export const Visitor = mongoose.models.Visitor || mongoose.model("Visitor", VisitorSchema);
export default Visitor;
