/**
 * ============================================================================
 * User Model
 * ============================================================================
 *
 * Layer:
 * Data Access / Entity
 *
 * Responsibility:
 * Defines the MongoDB schema for system users (Customers, Agents, Admins).
 * Stores credentials, RBAC roles, specific permissions, and linked agencies.
 *
 * Called By:
 * src/modules/users/users.repository.js
 * src/modules/auth/auth.repository.js
 * ============================================================================
 */
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },

    // Core Role-Based Access Control (RBAC) identifier
    role: { type: String, enum: ['user', 'agent', 'admin', 'superadmin'], default: 'user' },

    phone: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    status: { type: String, enum: ['Active', 'Suspended', 'Pending'], default: 'Active' },

    preferences: {
      currency: { type: String, default: 'INR' },
      language: { type: String, default: 'en' },
      notifications: { type: Boolean, default: true },
    },

    // Fine-grained permission strings for hybrid RBAC/ABAC (e.g., 'manage_blogs')
    permissions: [{ type: String }],

    // Optional link for users that act as B2B Travel Agents
    agencyRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', default: null },

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', userSchema);
