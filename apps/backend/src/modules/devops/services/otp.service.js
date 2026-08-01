import bcrypt from 'bcrypt';
import crypto from 'crypto';
import cache from '#config/cache.js';
import { logger } from '#shared/utils/logger.js';

const OTP_TTL_SEC = 10 * 60;

function otpKey(userId, purpose) {
  return `devops:otp:${purpose}:${userId}`;
}

export async function createOtpChallenge(userId, purpose = 'login') {
  const code = String(crypto.randomInt(100000, 999999));
  const codeHash = await bcrypt.hash(code, 10);
  const payload = JSON.stringify({ codeHash, attempts: 0, createdAt: Date.now() });

  try {
    await cache.set(otpKey(userId, purpose), payload, 'EX', OTP_TTL_SEC);
  } catch {
    // Redis degraded — keep in-memory fallback via Mongo not required for Phase 1; log code
  }

  // Always log in non-production for developer bootstrap
  if (process.env.NODE_ENV !== 'production') {
    logger.info({ userId: String(userId), purpose, code }, 'DEVOPS OTP (dev only)');
  } else {
    logger.info({ userId: String(userId), purpose }, 'DEVOPS OTP issued');
  }

  return {
    expiresInSec: OTP_TTL_SEC,
    devCode: process.env.NODE_ENV !== 'production' ? code : undefined,
  };
}

export async function verifyOtpChallenge(userId, purpose, code) {
  let raw;
  try {
    raw = await cache.get(otpKey(userId, purpose));
  } catch {
    return { ok: false, reason: 'otp_store_unavailable' };
  }
  if (!raw) return { ok: false, reason: 'otp_expired' };

  const data = JSON.parse(raw);
  if (data.attempts >= 5) {
    await cache.del(otpKey(userId, purpose));
    return { ok: false, reason: 'otp_locked' };
  }

  const match = await bcrypt.compare(String(code || ''), data.codeHash);
  if (!match) {
    data.attempts += 1;
    await cache.set(otpKey(userId, purpose), JSON.stringify(data), 'EX', OTP_TTL_SEC);
    return { ok: false, reason: 'otp_invalid' };
  }

  await cache.del(otpKey(userId, purpose));
  try {
    await cache.set(`devops:challenge:${userId}`, 'otp_ok', 'EX', 15 * 60);
  } catch {
    /* ignore */
  }
  return { ok: true };
}

export async function setChallengeFlag(userId, flag, ttlSec = 15 * 60) {
  try {
    await cache.set(`devops:challenge:${userId}:${flag}`, '1', 'EX', ttlSec);
  } catch {
    /* ignore */
  }
}

export async function hasChallengeFlag(userId, flag) {
  try {
    const v = await cache.get(`devops:challenge:${userId}:${flag}`);
    return Boolean(v);
  } catch {
    return false;
  }
}
