import cache from '../config/cache.js';
import { logger } from '../src/shared/logger.js';

/**
 * Cache-aside middleware using Redis.
 * @param {string|Function} keyFn - A static string key OR a function (req) => string
 * @param {number} ttl - Time to live in seconds (default: 300)
 */
export const cacheResponse = (keyFn, ttl = 300) => {
  return async (req, res, next) => {
    try {
      if (cache.status !== 'ready') return next();

      const cacheKey = typeof keyFn === 'function' ? keyFn(req) : keyFn;
      const cached = await cache.get(cacheKey);

      if (cached) {
        return res.json(JSON.parse(cached));
      }

      const originalJson = res.json.bind(res);
      res.json = (body) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cache.set(cacheKey, JSON.stringify(body), 'EX', ttl).catch((err) => {
            logger.error({ err }, 'Redis set error');
          });
        }
        return originalJson(body);
      };

      next();
    } catch (error) {
      logger.error({ error }, 'Cache middleware error');
      next();
    }
  };
};

/**
 * Invalidate one or more cache keys.
 * @param {...string} keys
 */
export const bustCache = async (...keys) => {
  if (cache.status !== 'ready') return;
  try {
    if (keys.length > 0) {
      await cache.del(...keys);
    }
  } catch (error) {
    logger.error({ error }, 'Redis delete error');
  }
};

/**
 * Flush all cache keys matching a prefix.
 * @param {string} prefix
 */
export const bustCacheByPrefix = async (prefix) => {
  if (cache.status !== 'ready') return;
  try {
    const keys = await cache.keys(`${prefix}*`);
    if (keys.length > 0) {
      await cache.del(...keys);
    }
  } catch (error) {
    logger.error({ error }, 'Redis prefix delete error');
  }
};
