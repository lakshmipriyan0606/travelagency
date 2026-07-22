import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "agent", "admin", "superadmin"], default: "user" },
    phone: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    status: { type: String, enum: ["Active", "Suspended", "Pending"], default: "Active" },
    preferences: {
      currency: { type: String, default: "INR" },
      language: { type: String, default: "en" },
      notifications: { type: Boolean, default: true }
    },
    permissions: [{ type: String }],
    agencyRef: { type: mongoose.Schema.Types.ObjectId, ref: "Agency", default: null },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
