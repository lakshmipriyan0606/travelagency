import Redis from 'ioredis';
import { logger } from '../src/shared/logger.js';

const redisConfig = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: 3,
};

const cache = new Redis(redisConfig);

cache.on('error', (err) => {
  logger.error({ err }, 'Redis connection error');
});

cache.on('connect', () => {
  logger.info('Connected to Redis successfully');
});

export default cache;
