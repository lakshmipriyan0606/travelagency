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
