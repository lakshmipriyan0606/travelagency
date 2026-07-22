/**
 * ============================================================================
 * MongoDB Configuration
 * ============================================================================
 *
 * Layer:
 * Configuration / Infrastructure
 *
 * Responsibility:
 * Establishes the connection to the MongoDB cluster using Mongoose.
 * Applies global plugins (like query profiling) and handles connection errors
 * fatally to prevent the app from starting in a degraded state.
 *
 * Called By:
 * src/server.js
 * ============================================================================
 */
// db.config.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { runStartupLocalhostCleanup } from '#modules/analytics/analytics.controller.js';
import mongooseProfiler from '../src/plugins/mongoose-profiler.js';

dotenv.config(); // Loads .env variables

// Apply the profiler globally to all schemas
mongoose.plugin(mongooseProfiler);

export const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in .env file');
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: 'travelagency', // Your DB name
      autoIndex: true, // Optional: builds indexes (set false in prod if needed)
      maxPoolSize: 10, // Optional: connection pool size
      serverSelectionTimeoutMS: 5000, // Timeout faster if cluster is down
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });

    console.log(`MongoDB Connected: ${conn.connection.host} → Database: ${conn.connection.name}`);
    runStartupLocalhostCleanup();
  } catch (error) {
    console.error('MongoDB Connection Failed:', error.message);
    process.exit(1); // Exit process with failure
  }
};
