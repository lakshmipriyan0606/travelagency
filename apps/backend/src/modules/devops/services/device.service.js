import crypto from 'crypto';
import DevopsDevice from '../models/devopsDevice.model.js';
import { hashValue } from './devopsCrypto.service.js';

export function hashFingerprint(raw) {
  return hashValue(
    String(raw || '')
      .trim()
      .toLowerCase()
  );
}

export async function upsertDevice(userId, fingerprintRaw, label = 'DevOps device') {
  const fingerprintHash = hashFingerprint(fingerprintRaw);
  const doc = await DevopsDevice.findOneAndUpdate(
    { userId, fingerprintHash },
    {
      $set: { lastSeenAt: new Date(), label },
      $setOnInsert: { firstSeenAt: new Date(), trusted: false },
    },
    { upsert: true, new: true }
  );
  return doc;
}

export async function trustDevice(userId, fingerprintRaw) {
  const fingerprintHash = hashFingerprint(fingerprintRaw);
  const trustExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const doc = await DevopsDevice.findOneAndUpdate(
    { userId, fingerprintHash, revokedAt: null },
    {
      $set: {
        trusted: true,
        trustExpiresAt,
        lastSeenAt: new Date(),
        deviceId: fingerprintHash,
      },
    },
    { new: true }
  );
  return doc;
}

export async function isDeviceTrusted(userId, fingerprintRaw) {
  const fingerprintHash = hashFingerprint(fingerprintRaw);
  const doc = await DevopsDevice.findOne({
    userId,
    fingerprintHash,
    trusted: true,
    revokedAt: null,
  }).lean();
  if (!doc) return false;
  if (doc.trustExpiresAt && doc.trustExpiresAt < new Date()) return false;
  return true;
}

export function newSessionId() {
  return crypto.randomUUID();
}

export function newCsrfSecret() {
  return crypto.randomBytes(24).toString('hex');
}
