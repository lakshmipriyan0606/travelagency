import mongoose from 'mongoose';
import { jest } from '@jest/globals';
import cache from '#config/cache.js';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI);
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  try {
    if (cache.status === 'ready' || cache.status === 'connecting') {
      await cache.quit();
    } else {
      cache.disconnect();
    }
  } catch (err) {
    // Ignore quit errors if already closed
  }
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});
