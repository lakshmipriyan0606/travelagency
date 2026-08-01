import cache from '#config/cache.js';
import { logger } from '#shared/utils/logger.js';

const TZ = 'Asia/Kolkata';
const SKEW_MINUTES = 1;
const MAX_ATTEMPTS = 5;
const ATTEMPTS_TTL_SEC = 10 * 60;

/** In-process fallback when Redis is down (common in local dev). */
const memoryStore = new Map();

function attemptsKey(userId, purpose) {
  return `devops:otp:attempts:${purpose}:${userId}`;
}

function memGet(key) {
  const entry = memoryStore.get(key);
  if (!entry) return null;
  if (entry.expiresAt && Date.now() > entry.expiresAt) {
    memoryStore.delete(key);
    return null;
  }
  return entry.value;
}

function memSet(key, value, ttlSec) {
  memoryStore.set(key, {
    value,
    expiresAt: Date.now() + Number(ttlSec) * 1000,
  });
}

function memDel(key) {
  memoryStore.delete(key);
}

async function storeGet(key) {
  try {
    const v = await cache.get(key);
    if (v != null) return v;
  } catch {
    /* Redis degraded */
  }
  return memGet(key);
}

async function storeSet(key, value, ttlSec) {
  memSet(key, value, ttlSec);
  try {
    await cache.set(key, value, 'EX', ttlSec);
  } catch {
    /* memory only */
  }
}

async function storeDel(key) {
  memDel(key);
  try {
    await cache.del(key);
  } catch {
    /* ignore */
  }
}

/** Wall-clock parts in Asia/Kolkata (hour 0–23). */
export function getKolkataParts(date = new Date()) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  });
  const map = Object.fromEntries(
    fmt
      .formatToParts(date)
      .filter((p) => p.type !== 'literal')
      .map((p) => [p.type, p.value])
  );
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
  };
}

/** 12-hour clock 1–12 (5 PM → 5, midnight → 12, noon → 12). */
export function hour12FromHour24(hour24) {
  return ((Number(hour24) + 11) % 12) + 1;
}

/**
 * OTP = day + month + year + hour12 + minute (numeric sum as string).
 * Example: 1 Aug 2026 17:26 IST → 1+8+2026+5+26 = 2066
 */
export function computeDateTimeOtp(parts) {
  const hour12 = hour12FromHour24(parts.hour);
  return String(parts.day + parts.month + parts.year + hour12 + parts.minute);
}

export function validOtpsForNow(now = new Date(), skewMinutes = SKEW_MINUTES) {
  const codes = new Set();
  for (let delta = -skewMinutes; delta <= skewMinutes; delta += 1) {
    const d = new Date(now.getTime() + delta * 60_000);
    codes.add(computeDateTimeOtp(getKolkataParts(d)));
  }
  return codes;
}

/** Bootstrap no longer issues a stored/emailed code — only clears attempt budget. */
export async function createOtpChallenge(userId, purpose = 'login') {
  await storeDel(attemptsKey(userId, purpose));
  logger.info(
    { userId: String(userId), purpose, timezone: TZ, skewMinutes: SKEW_MINUTES },
    'DEVOPS OTP challenge started (date+time sum)'
  );
  return {
    timezone: TZ,
    skewMinutes: SKEW_MINUTES,
    formula: 'day+month+year+hour12+minute',
  };
}

export async function verifyOtpChallenge(userId, purpose, code) {
  const submitted = String(code ?? '').trim();
  if (!/^\d{4,5}$/.test(submitted)) {
    return { ok: false, reason: 'otp_invalid' };
  }

  const rawAttempts = await storeGet(attemptsKey(userId, purpose));
  let attempts = rawAttempts ? Number(rawAttempts) || 0 : 0;

  if (attempts >= MAX_ATTEMPTS) {
    return { ok: false, reason: 'otp_locked' };
  }

  const valid = validOtpsForNow();
  if (!valid.has(submitted)) {
    attempts += 1;
    await storeSet(attemptsKey(userId, purpose), String(attempts), ATTEMPTS_TTL_SEC);
    if (process.env.NODE_ENV !== 'production') {
      logger.info({ submitted, valid: [...valid], attempts }, 'DEVOPS OTP mismatch (dev)');
    }
    if (attempts >= MAX_ATTEMPTS) return { ok: false, reason: 'otp_locked' };
    return { ok: false, reason: 'otp_invalid' };
  }

  await storeDel(attemptsKey(userId, purpose));
  await storeSet(`devops:challenge:${userId}`, 'otp_ok', 15 * 60);
  return { ok: true };
}

export async function setChallengeFlag(userId, flag, ttlSec = 15 * 60) {
  await storeSet(`devops:challenge:${userId}:${flag}`, '1', ttlSec);
}

export async function hasChallengeFlag(userId, flag) {
  const v = await storeGet(`devops:challenge:${userId}:${flag}`);
  return Boolean(v);
}
