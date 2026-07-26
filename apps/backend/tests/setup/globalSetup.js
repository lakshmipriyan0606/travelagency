import { MongoMemoryReplSet } from 'mongodb-memory-server';

export default async function globalSetup() {
  const instance = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = instance.getUri();
  global.__MONGOINSTANCE = instance;
  process.env.MONGO_URI = uri;
  process.env.JWT_SECRET = 'test-secret';
  process.env.NODE_ENV = 'test';
  process.env.PORT = '3001';
}
