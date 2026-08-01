import { authenticator } from 'otplib';
import DevopsTotpSecret from '../models/devopsTotpSecret.model.js';
import { decryptSecret, encryptSecret } from './devopsCrypto.service.js';

export async function getTotpStatus(userId) {
  const row = await DevopsTotpSecret.findOne({ userId }).lean();
  return { enrolled: Boolean(row) };
}

export async function setupTotp(userId, email) {
  const existing = await DevopsTotpSecret.findOne({ userId });
  if (existing) {
    return { alreadyEnrolled: true };
  }
  const secret = authenticator.generateSecret();
  const secretEnc = encryptSecret(secret);
  await DevopsTotpSecret.create({
    userId,
    secretEnc,
    enabledAt: new Date(),
  });
  const otpauth = authenticator.keyuri(email || String(userId), 'TravelHero DevOps', secret);
  return { secret, otpauth, alreadyEnrolled: false };
}

export async function verifyTotp(userId, token) {
  const row = await DevopsTotpSecret.findOne({ userId });
  if (!row) return { ok: false, reason: 'totp_not_enrolled' };
  const secret = decryptSecret(row.secretEnc);
  const ok = authenticator.check(String(token || ''), secret);
  if (!ok) return { ok: false, reason: 'totp_invalid' };
  row.lastUsedAt = new Date();
  await row.save();
  return { ok: true };
}
