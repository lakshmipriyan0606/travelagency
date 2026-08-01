/* eslint-disable no-console -- CLI script feedback */
/**
 * Clear all B2B custom package proposal documents from MongoDB.
 *
 * Safe for dev/testing — only deletes CustomProposal collection documents.
 * Does NOT touch agencies, masters (cities/hotels/packages), or quotes.
 *
 * Usage (from repo root):
 *   pnpm --filter backend clear:proposals
 *
 * Or directly:
 *   node apps/backend/scripts/clear-custom-proposals.js
 *
 * Requires MONGO_URI in environment or apps/backend/.env
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import CustomProposal from '../src/modules/b2b/models/customProposal.model.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/travelagency';

async function clearCustomProposals() {
  try {
    console.log(`Connecting to MongoDB at ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    const countBefore = await CustomProposal.countDocuments();
    console.log(`Found ${countBefore} custom proposal document(s).`);

    if (countBefore === 0) {
      console.log('Nothing to delete.');
      return;
    }

    const result = await CustomProposal.deleteMany({});
    console.log(`Deleted ${result.deletedCount} custom proposal document(s).`);
    console.log('Done — agencies, masters, and quotes were not modified.');
  } catch (err) {
    console.error('Failed to clear custom proposals:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

clearCustomProposals();
