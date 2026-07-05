import mongoose from "mongoose";

const ApiHitSchema = new mongoose.Schema({
  date: { type: String, required: true },
  method: { type: String, required: true },
  route: { type: String, required: true },
  status: { type: Number, required: true },
  count: { type: Number, default: 0 },
});

ApiHitSchema.index({ date: 1, method: 1, route: 1, status: 1 }, { unique: true });

export default mongoose.model("ApiHit", ApiHitSchema);
