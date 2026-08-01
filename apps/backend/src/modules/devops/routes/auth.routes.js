import express from 'express';
import { sendSuccess } from '#shared/utils/response.js';
import {
  devopsIdentityChain,
  devopsCsrf,
  requireDevopsSession,
} from '../middleware/devopsAuth.middleware.js';
import {
  createOtpChallenge,
  hasChallengeFlag,
  setChallengeFlag,
  verifyOtpChallenge,
} from '../services/otp.service.js';
import { getTotpStatus, setupTotp, verifyTotp } from '../services/totp.service.js';
import { isDeviceTrusted, trustDevice, upsertDevice } from '../services/device.service.js';
import {
  clearDevopsCookies,
  DEVOPS_COOKIE,
  issueDevopsSession,
  loadDevopsSession,
  revokeSession,
  setDevopsCookies,
} from '../services/devopsAuth.service.js';
import { clientIp } from '../services/devopsCrypto.service.js';
import { writeAudit } from '../services/audit.service.js';

const router = express.Router();

router.post('/bootstrap', ...devopsIdentityChain, async (req, res) => {
  const otp = await createOtpChallenge(req.user._id, 'login');
  await writeAudit({
    actorUserId: req.user._id,
    action: 'devops.auth.bootstrap',
    ip: clientIp(req),
    result: 'ok',
  });
  const totp = await getTotpStatus(req.user._id);
  return sendSuccess(res, 200, 'OTP challenge started', {
    data: {
      next: 'otp',
      totpEnrolled: totp.enrolled,
      expiresInSec: otp.expiresInSec,
      ...(otp.devCode ? { devOtp: otp.devCode } : {}),
      user: { id: req.user._id, email: req.user.email, role: req.user.role },
    },
  });
});

router.post('/otp/verify', ...devopsIdentityChain, async (req, res) => {
  const result = await verifyOtpChallenge(req.user._id, 'login', req.body?.code);
  if (!result.ok) {
    await writeAudit({
      actorUserId: req.user._id,
      action: 'devops.auth.otp',
      ip: clientIp(req),
      result: 'denied',
      meta: { reason: result.reason },
    });
    return res.status(401).json({ success: false, message: result.reason || 'OTP failed' });
  }
  await setChallengeFlag(req.user._id, 'otp');
  const totp = await getTotpStatus(req.user._id);
  return sendSuccess(res, 200, 'OTP verified', {
    data: { next: 'totp', totpEnrolled: totp.enrolled },
  });
});

router.post('/totp/setup', ...devopsIdentityChain, async (req, res) => {
  if (!(await hasChallengeFlag(req.user._id, 'otp'))) {
    return res.status(403).json({ success: false, message: 'OTP required first' });
  }
  const setup = await setupTotp(req.user._id, req.user.email);
  if (setup.alreadyEnrolled) {
    return sendSuccess(res, 200, 'TOTP already enrolled', {
      data: { alreadyEnrolled: true },
    });
  }
  return sendSuccess(res, 200, 'TOTP setup ready', {
    data: { secret: setup.secret, otpauth: setup.otpauth, alreadyEnrolled: false },
  });
});

router.post('/totp/verify', ...devopsIdentityChain, async (req, res) => {
  if (!(await hasChallengeFlag(req.user._id, 'otp'))) {
    return res.status(403).json({ success: false, message: 'OTP required first' });
  }
  const status = await getTotpStatus(req.user._id);
  if (!status.enrolled) {
    return res.status(400).json({ success: false, message: 'Run totp/setup first' });
  }
  const result = await verifyTotp(req.user._id, req.body?.token);
  if (!result.ok) {
    return res.status(401).json({ success: false, message: result.reason || 'TOTP failed' });
  }
  await setChallengeFlag(req.user._id, 'totp');
  return sendSuccess(res, 200, 'TOTP verified', { data: { next: 'device' } });
});

router.post('/device/register', ...devopsIdentityChain, async (req, res) => {
  if (!(await hasChallengeFlag(req.user._id, 'totp'))) {
    return res.status(403).json({ success: false, message: 'TOTP required first' });
  }
  const fp = req.body?.fingerprint;
  if (!fp) return res.status(400).json({ success: false, message: 'fingerprint required' });
  const device = await upsertDevice(req.user._id, fp, req.body?.label || 'DevOps device');
  const trusted = await isDeviceTrusted(req.user._id, fp);
  return sendSuccess(res, 200, 'Device registered', {
    data: {
      trusted,
      deviceId: device.fingerprintHash,
      next: trusted ? 'session' : 'device_verify',
    },
  });
});

router.post('/device/verify', ...devopsIdentityChain, async (req, res) => {
  if (!(await hasChallengeFlag(req.user._id, 'totp'))) {
    return res.status(403).json({ success: false, message: 'TOTP required first' });
  }
  const fp = req.body?.fingerprint;
  if (!fp) return res.status(400).json({ success: false, message: 'fingerprint required' });
  // After OTP+TOTP, first-time device trust is granted (re-verify every 30d via trustExpiresAt)
  const device = await trustDevice(req.user._id, fp);
  if (!device) return res.status(400).json({ success: false, message: 'Register device first' });
  await setChallengeFlag(req.user._id, 'device');
  return sendSuccess(res, 200, 'Device trusted', {
    data: { next: 'session', deviceId: device.fingerprintHash },
  });
});

router.post('/session', ...devopsIdentityChain, async (req, res) => {
  const fp = req.body?.fingerprint;
  if (!fp) return res.status(400).json({ success: false, message: 'fingerprint required' });
  if (
    !(await hasChallengeFlag(req.user._id, 'otp')) ||
    !(await hasChallengeFlag(req.user._id, 'totp'))
  ) {
    return res.status(403).json({ success: false, message: 'Complete OTP and TOTP first' });
  }
  const trusted = await isDeviceTrusted(req.user._id, fp);
  if (!trusted) {
    return res.status(403).json({ success: false, message: 'Device not trusted' });
  }
  const now = new Date();
  const issued = await issueDevopsSession({
    userId: req.user._id,
    fingerprintRaw: fp,
    req,
    otpVerifiedAt: now,
    totpVerifiedAt: now,
    deviceVerifiedAt: now,
  });
  setDevopsCookies(res, issued.sessionId, issued.csrfSecret);
  return sendSuccess(res, 200, 'DevOps session issued', {
    data: { expiresAt: issued.expiresAt, csrf: issued.csrfSecret },
  });
});

router.get('/session', ...devopsIdentityChain, requireDevopsSession, async (req, res) => {
  return sendSuccess(res, 200, 'DevOps session active', {
    data: {
      active: true,
      expiresAt: req.devopsSession.expiresAt,
      user: { id: req.user._id, email: req.user.email, role: req.user.role },
    },
  });
});

router.post('/logout', ...devopsIdentityChain, async (req, res) => {
  const sessionId = req.cookies?.[DEVOPS_COOKIE];
  if (sessionId) await revokeSession(sessionId, req.user._id, req);
  clearDevopsCookies(res);
  return sendSuccess(res, 200, 'DevOps logged out');
});

export default router;
