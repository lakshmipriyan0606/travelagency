import mongoose from 'mongoose';

/**
 * Periodic capacity samples for growth rate + forecast.
 * First deploy has no history — growth fields stay null until ≥2 snapshots exist.
 */
const devopsCapacitySnapshotSchema = new mongoose.Schema(
  {
    ts: { type: Date, default: Date.now, index: true },
    disk: {
      path: String,
      totalBytes: Number,
      usedBytes: Number,
      freeBytes: Number,
      pctUsed: Number,
    },
    mongo: {
      dataSize: Number,
      storageSize: Number,
      indexSize: Number,
      collections: Number,
      objects: Number,
      fsUsedSize: Number,
      fsTotalSize: Number,
    },
    memory: {
      totalBytes: Number,
      freeBytes: Number,
      usedPct: Number,
      heapUsed: Number,
      rss: Number,
    },
    redis: {
      available: Boolean,
      usedMemory: Number,
      maxMemory: Number,
      pctUsed: Number,
    },
    cpu: {
      load1: Number,
      load5: Number,
      load15: Number,
      cores: Number,
    },
  },
  { timestamps: false, collection: 'devops_capacity_snapshots' }
);

/** Keep ~90 days of samples */
devopsCapacitySnapshotSchema.index({ ts: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export default mongoose.model('DevopsCapacitySnapshot', devopsCapacitySnapshotSchema);
