/* eslint-disable no-console -- CLI script feedback */
/**
 * Clear all B2B quote request documents from MongoDB.
 *
 * Safe for dev/testing — only deletes QuoteRequest collection documents.
 * Does NOT touch agencies, agency users, or any other collections.
 *
 * Usage (from repo root):
 *   pnpm --filter backend clear:quotes
 *
 * Or directly:
 *   node apps/backend/scripts/clear-quote-requests.js
 *
 * Requires MONGO_URI in environment or apps/backend/.env
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import QuoteRequest from '../src/modules/b2b/models/quoteRequest.model.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/travelagency';

async function clearQuoteRequests() {
  try {
    console.log(`Connecting to MongoDB at ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    const countBefore = await QuoteRequest.countDocuments();
    console.log(`Found ${countBefore} quote request document(s).`);

    if (countBefore === 0) {
      console.log('Nothing to delete.');
      return;
    }

    const result = await QuoteRequest.deleteMany({});
    console.log(`Deleted ${result.deletedCount} quote request document(s).`);
    console.log('Done — agencies and users were not modified.');
  } catch (err) {
    console.error('Failed to clear quote requests:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

clearQuoteRequests();
