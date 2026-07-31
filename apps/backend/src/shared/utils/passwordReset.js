/**
 * Shared password-reset helpers (token generation, hashing, email).
 */
import crypto from 'crypto';
import { sendTransactionalEmail } from '#integrations/email/mailerTransport.js';
import { logger } from '#shared/utils/logger.js';

export const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000; // 1 hour

export function createPasswordResetToken() {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);
  return { rawToken, tokenHash, expiresAt };
}

export function hashPasswordResetToken(rawToken) {
  return crypto.createHash('sha256').update(String(rawToken)).digest('hex');
}

/**
 * Always-safe public message — never reveals whether the email exists.
 */
export const PASSWORD_RESET_REQUEST_MESSAGE =
  'If an account exists for that email, a password reset link has been sent.';

export async function sendPasswordResetEmail({ to, resetUrl, productName }) {
  const subject = `Reset your ${productName} password`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#111;background:#0c0c0f;padding:32px;border-radius:16px;border:1px solid #222;">
      <h2 style="color:#F8B400;margin:0 0 12px;">Reset your password</h2>
      <p style="color:#ddd;line-height:1.5;">
        We received a request to reset your <strong style="color:#fff;">${productName}</strong> password.
        This link expires in 1 hour.
      </p>
      <p style="margin:28px 0;">
        <a href="${resetUrl}"
           style="display:inline-block;background:linear-gradient(90deg,#FFD54A,#F8B400);color:#111;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:999px;">
          Reset Password
        </a>
      </p>
      <p style="color:#888;font-size:12px;line-height:1.5;">
        If you did not request this, you can ignore this email. Your password will stay the same.
      </p>
      <p style="color:#555;font-size:11px;word-break:break-all;">${resetUrl}</p>
    </div>
  `;

  try {
    await sendTransactionalEmail({ to, subject, html });
  } catch (err) {
    logger.error({ err, to }, 'Failed to send password reset email');
    throw err;
  }
}

export function buildResetUrl(baseUrl, path, token) {
  const normalizedBase = String(baseUrl || '').replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new globalThis.URL(`${normalizedBase}${normalizedPath}`);
  url.searchParams.set('token', token);
  return url.toString();
}
