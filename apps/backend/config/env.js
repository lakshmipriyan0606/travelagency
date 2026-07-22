/**
 * ============================================================================
 * Environment Configuration Validation
 * ============================================================================
 *
 * Layer:
 * Configuration
 *
 * Responsibility:
 * Uses `envalid` to assert that all required environment variables are present
 * and properly typed before the application boots. Prevents runtime crashes
 * caused by missing or malformed configuration.
 *
 * Called By:
 * src/server.js (executed at the very start of the process)
 * ============================================================================
 */
import { cleanEnv, str, port } from 'envalid';
import dotenv from 'dotenv';

dotenv.config();

export const env = cleanEnv(process.env, {
  NODE_ENV: str({
    choices: ['development', 'test', 'production', 'staging'],
    default: 'development',
  }),
  PORT: port({ default: 5000 }),
  MONGO_URI: str({ desc: 'MongoDB connection string' }),
  JWT_SECRET: str({ desc: 'Secret for signing JWT tokens' }),
});
