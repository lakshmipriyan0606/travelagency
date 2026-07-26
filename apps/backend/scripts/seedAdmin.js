import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { AdminUser } from '../src/modules/b2b/models/adminUser.model.js';

dotenv.config();

const BCRYPT_SALT_ROUNDS = 12;

async function run() {
  const email = process.env.ADMIN_SEED_EMAIL;
  const password = process.env.ADMIN_SEED_PASSWORD;
  const mongoUri = process.env.MONGO_URI;

  if (!email || !password) {
    console.error(
      'Error: ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD must be defined in environment.'
    );
    process.exit(1);
  }

  if (!mongoUri) {
    console.error('Error: MONGO_URI is not defined in environment.');
    process.exit(1);
  }

  console.log('Connecting to database...');
  await mongoose.connect(mongoUri, { dbName: 'travelagency' });
  console.log('Connected to database.');

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await AdminUser.findOne({ email: normalizedEmail });

  if (existing) {
    console.log(`Admin user with email ${normalizedEmail} already exists. Skipping seed.`);
  } else {
    console.log(`Creating superadmin user: ${normalizedEmail}...`);
    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    await AdminUser.create({
      name: 'Super Admin',
      email: normalizedEmail,
      passwordHash,
      role: 'superadmin',
      isActive: true,
    });
    console.log('Superadmin user created successfully.');
  }

  await mongoose.disconnect();
  console.log('Database disconnected.');
}

run().catch((err) => {
  console.error('Seed script failed:', err);
  process.exit(1);
});
