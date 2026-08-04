import mongoose from 'mongoose';

const adminUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true, select: false },
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    role: {
      type: String,
      enum: ['superadmin', 'admin', 'ops', 'finance', 'sales'],
      required: true,
    },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

export const AdminUser = mongoose.models.AdminUser || mongoose.model('AdminUser', adminUserSchema);
export default AdminUser;
