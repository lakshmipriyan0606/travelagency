import crypto from 'crypto';
import cache from '#config/cache.js';
import DevopsSession from '../models/devopsSession.model.js';
import { writeAudit } from './audit.service.js';
import { hashFingerprint, newCsrfSecret, newSessionId } from './device.service.js';
import { clientIp } from './devopsCrypto.service.js';

export const DEVOPS_COOKIE = 'devops_session';
export const DEVOPS_CSRF_COOKIE = 'devops_csrf';
const SESSION_TTL_MS = 30 * 60 * 1000;
const SESSION_HARD_MS = 8 * 60 * 60 * 1000;

export async function issueDevopsSession({
  userId,
  fingerprintRaw,
  req,
  otpVerifiedAt,
  totpVerifiedAt,
  deviceVerifiedAt,
}) {
  const sessionId = newSessionId();
  const csrfSecret = newCsrfSecret();
  const deviceId = hashFingerprint(fingerprintRaw);
  const now = Date.now();
  const expiresAt = new Date(Math.min(now + SESSION_TTL_MS, now + SESSION_HARD_MS));

  await DevopsSession.create({
    userId,
    sessionId,
    deviceId,
    ip: clientIp(req),
    userAgent: String(req.headers['user-agent'] || '').slice(0, 400),
    csrfSecret,
    otpVerifiedAt,
    totpVerifiedAt,
    deviceVerifiedAt,
    lastSeenAt: new Date(),
    expiresAt,
  });

  try {
    await cache.set(
      `devops:session:${sessionId}`,
      JSON.stringify({ userId: String(userId), deviceId, csrfSecret }),
      'EX',
      Math.floor(SESSION_TTL_MS / 1000)
    );
  } catch {
    /* redis optional */
  }

  await writeAudit({
    actorUserId: userId,
    action: 'devops.session.issue',
    ip: clientIp(req),
    deviceId,
    result: 'ok',
  });

  return { sessionId, csrfSecret, expiresAt };
}

export function setDevopsCookies(res, sessionId, csrfSecret) {
  const secure = process.env.NODE_ENV === 'production';
  res.cookie(DEVOPS_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: SESSION_TTL_MS,
  });
  res.cookie(DEVOPS_CSRF_COOKIE, csrfSecret, {
    httpOnly: false,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: SESSION_TTL_MS,
  });
}

export function clearDevopsCookies(res) {
  res.clearCookie(DEVOPS_COOKIE, { path: '/' });
  res.clearCookie(DEVOPS_CSRF_COOKIE, { path: '/' });
}

export async function loadDevopsSession(sessionId) {
  if (!sessionId) return null;
  const doc = await DevopsSession.findOne({
    sessionId,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });
  return doc;
}

export async function touchSession(doc) {
  const next = new Date(Date.now() + SESSION_TTL_MS);
  doc.lastSeenAt = new Date();
  doc.expiresAt = next;
  await doc.save();
  try {
    await cache.expire(`devops:session:${doc.sessionId}`, Math.floor(SESSION_TTL_MS / 1000));
  } catch {
    /* ignore */
  }
}

export async function revokeSession(sessionId, userId, req) {
  await DevopsSession.updateOne({ sessionId }, { $set: { revokedAt: new Date() } });
  try {
    await cache.del(`devops:session:${sessionId}`);
  } catch {
    /* ignore */
  }
  await writeAudit({
    actorUserId: userId,
    action: 'devops.session.revoke',
    ip: req ? clientIp(req) : '',
    result: 'ok',
  });
}

export function challengeToken(userId) {
  return crypto
    .createHmac('sha256', process.env.JWT_SECRET || 'devops')
    .update(`challenge:${userId}`)
    .digest('hex')
    .slice(0, 24);
}
