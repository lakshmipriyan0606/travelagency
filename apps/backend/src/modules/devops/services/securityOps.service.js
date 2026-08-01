/**
 * Security operations — real audit + env signals only.
 */
import DevopsAuditLog from '../models/devopsAuditLog.model.js';
import { parseAllowlist } from './devopsCrypto.service.js';

const AUTH_FAIL_ACTIONS = [
  'devops.auth.denied',
  'devops.auth.otp.fail',
  'devops.auth.bootstrap.denied',
  'devops.auth.session.denied',
  'devops.ip.denied',
  'devops.csrf.denied',
];

export async function getSecurityOpsSummary({ from, to, limit = 50 } = {}) {
  const end = to ? new Date(to) : new Date();
  const start = from ? new Date(from) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const allowlist = parseAllowlist();

  const [failedAuth, deniedActions, recentDenied] = await Promise.all([
    DevopsAuditLog.countDocuments({
      ts: { $gte: start, $lte: end },
      $or: [{ result: 'denied' }, { action: { $in: AUTH_FAIL_ACTIONS } }],
    }),
    DevopsAuditLog.countDocuments({
      ts: { $gte: start, $lte: end },
      result: 'denied',
    }),
    DevopsAuditLog.find({
      ts: { $gte: start, $lte: end },
      result: 'denied',
    })
      .sort({ ts: -1 })
      .limit(Math.min(Number(limit) || 50, 200))
      .lean(),
  ]);

  return {
    collectedAt: new Date().toISOString(),
    range: { from: start.toISOString(), to: end.toISOString() },
    failedDevopsAuth: {
      available: true,
      count: failedAuth,
      note: 'Counts devops_audit_logs with denied result or known auth-fail actions.',
    },
    deniedActions: {
      available: true,
      count: deniedActions,
    },
    ipAllowlist: {
      available: true,
      enabled: allowlist.length > 0,
      entryCount: allowlist.length,
      // Never echo raw allowlist IPs to reduce recon value — status only
      status: allowlist.length
        ? 'configured (entries hidden)'
        : 'disabled — all IPs allowed when other auth passes',
      reason: allowlist.length ? null : 'DEVOPS_IP_ALLOWLIST empty; IP gate is open.',
    },
    rateLimit: {
      available: true,
      note: 'express-rate-limit is mounted on /api/v1/devops; per-IP hit counters are not persisted to Mongo.',
      persistedSignals: false,
      reason: 'No durable rate-limit telemetry store — only in-process limiter state.',
    },
    recentDenied: recentDenied.map((r) => ({
      ts: r.ts,
      action: r.action,
      ip: r.ip ? `${String(r.ip).slice(0, 8)}…` : '',
      result: r.result,
      meta: r.meta || {},
    })),
    gaps: [
      {
        id: 'xss',
        available: false,
        reason: 'No XSS probe / WAF event pipeline instrumented.',
      },
      {
        id: 'sqli',
        available: false,
        reason: 'No SQLi/NoSQL injection attempt telemetry instrumented.',
      },
      {
        id: 'csrf_product',
        available: false,
        reason: 'Product CSRF denials are not mirrored into devops_audit_logs.',
      },
    ],
  };
}
