/**
 * ============================================================================
 * Cryptography Utilities
 * ============================================================================
 *
 * Layer:
 * Shared Utility / Security
 *
 * Responsibility:
 * Provides AES-256-GCM symmetric encryption for sensitive PII data before
 * it gets persisted to the database. Essential for GDPR compliance.
 *
 * Called By:
 * src/modules/bookings/booking.service.js
 * ============================================================================
 */
import crypto from 'crypto';

const KEY = Buffer.from(process.env.DATA_ENCRYPTION_KEY, 'hex'); // must be 32 bytes

export function encryptValue(value) {
  if (value === null || value === undefined) return null;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);

  const encrypted = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${iv.toString('base64')}:${encrypted.toString('base64')}:${tag.toString('base64')}`;
}

export function decryptValue(payload) {
  if (!payload || typeof payload !== 'string') return payload;

  const parts = payload.split(':');
  if (parts.length !== 3) return payload;

  const [ivB64, dataB64, tagB64] = parts;
  const iv = Buffer.from(ivB64, 'base64');
  const encrypted = Buffer.from(dataB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');

  const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}
