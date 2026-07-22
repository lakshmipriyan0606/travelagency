import cache from "../config/cache.js";

/**
 * Cache-aside middleware.
 * @param {string|Function} keyFn - A static string key OR a function (req) => string
 * @param {number} ttl - Time to live in seconds (default: 300)
 */
export const cacheResponse = (keyFn, ttl = 300) => {
  return (req, res, next) => {
    const cacheKey =
      typeof keyFn === "function" ? keyFn(req) : keyFn;

    const cached = cache.get(cacheKey);
    if (cached !== undefined) {
      console.log(`[Cache HIT] ${cacheKey}`);
      return res.json(cached);
    }

    console.log(`[Cache MISS] ${cacheKey}`);

    // Intercept res.json to store the response in cache
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(cacheKey, body, ttl);
      }
      return originalJson(body);
    };

    next();
  };
};

/**
 * Invalidate one or more cache keys. Pass exact keys or key patterns.
 * @param {...string} keys
 */
export const bustCache = (...keys) => {
  keys.forEach((key) => {
    cache.del(key);
    console.log(`[Cache BUST] ${key}`);
  });
};

/**
 * Flush all cache keys matching a prefix.
 * @param {string} prefix
 */
export const bustCacheByPrefix = (prefix) => {
  const allKeys = cache.keys();
  const matched = allKeys.filter((k) => k.startsWith(prefix));
  matched.forEach((k) => cache.del(k));
  if (matched.length) console.log(`[Cache BUST] ${matched.length} keys with prefix "${prefix}"`);
};
