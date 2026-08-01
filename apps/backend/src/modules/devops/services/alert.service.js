/**
 * Alert Center — unify live capacity alerts + open critical errors.
 * Ack/resolve persists to devops_alerts; ephemeral live signals stay honest.
 */
import DevopsAlert from '../models/devopsAlert.model.js';
import DevopsErrorEvent from '../models/devopsErrorEvent.model.js';
import { getCapacityAlerts } from './capacity.service.js';
import { enrichErrorEvent } from './monitoring.service.js';

function orderSeverity(s) {
  return { critical: 0, warning: 1, info: 2 }[s] ?? 9;
}

export async function getUnifiedAlerts({ status = 'open' } = {}) {
  const [cap, openErrors, stored] = await Promise.all([
    getCapacityAlerts(),
    DevopsErrorEvent.find({ status: 'open' }).sort({ lastSeenAt: -1 }).limit(100).lean(),
    DevopsAlert.find(
      status === 'all' ? {} : { status: status === 'open' ? { $in: ['open', 'ack'] } : status }
    )
      .sort({ lastSeenAt: -1 })
      .limit(200)
      .lean(),
  ]);

  /** @type {Map<string, object>} */
  const byFp = new Map();

  for (const row of stored) {
    byFp.set(row.fingerprint, {
      fingerprint: row.fingerprint,
      severity: row.severity,
      source: row.source,
      title: row.title,
      cause: row.cause,
      impact: row.impact,
      action: row.action,
      eta: row.eta,
      status: row.status,
      resource: row.resource || '',
      meta: row.meta || {},
      firstSeenAt: row.firstSeenAt,
      lastSeenAt: row.lastSeenAt,
      ephemeral: false,
      ackable: true,
    });
  }

  for (const a of cap.alerts || []) {
    const fingerprint = `capacity:${a.id}`;
    const existing = byFp.get(fingerprint);
    if (existing?.status === 'resolved') continue;
    byFp.set(fingerprint, {
      fingerprint,
      severity: a.severity,
      source: 'capacity',
      title: a.cause,
      cause: a.cause,
      impact: a.impact,
      action: a.action,
      eta: a.eta || null,
      status: existing?.status === 'ack' ? 'ack' : 'open',
      resource: a.resource || '',
      meta: { capacityAlertId: a.id },
      firstSeenAt: existing?.firstSeenAt || new Date(),
      lastSeenAt: new Date(cap.collectedAt || Date.now()),
      ephemeral: !existing,
      ackable: true,
    });
  }

  for (const raw of openErrors) {
    const e = enrichErrorEvent(raw);
    if (e.severity !== 'critical') continue;
    const fingerprint = `error:${e.fingerprint}`;
    const existing = byFp.get(fingerprint);
    if (existing?.status === 'resolved') continue;
    byFp.set(fingerprint, {
      fingerprint,
      severity: 'critical',
      source: 'error',
      title: e.message,
      cause: `${e.category}: ${e.message}`,
      impact: `×${e.occurrences} since ${e.firstSeenAt ? new Date(e.firstSeenAt).toISOString() : '—'}`,
      action: 'Inspect Errors inbox; ack or resolve the fingerprint',
      eta: null,
      status: existing?.status === 'ack' ? 'ack' : 'open',
      resource: e.app || '',
      meta: {
        errorFingerprint: e.fingerprint,
        category: e.category,
        sentryUrl: e.sentryUrl,
      },
      firstSeenAt: e.firstSeenAt,
      lastSeenAt: e.lastSeenAt,
      ephemeral: !existing,
      ackable: true,
    });
  }

  let items = [...byFp.values()];
  if (status === 'open') {
    items = items.filter((i) => i.status === 'open' || i.status === 'ack');
  } else if (status !== 'all') {
    items = items.filter((i) => i.status === status);
  }

  items.sort((a, b) => {
    const sev = orderSeverity(a.severity) - orderSeverity(b.severity);
    if (sev !== 0) return sev;
    return new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime();
  });

  return {
    collectedAt: new Date().toISOString(),
    capacityOverallHealth: cap.overallHealth,
    summary: {
      critical: items.filter((i) => i.severity === 'critical' && i.status !== 'resolved').length,
      warning: items.filter((i) => i.severity === 'warning' && i.status !== 'resolved').length,
      open: items.filter((i) => i.status === 'open').length,
      ack: items.filter((i) => i.status === 'ack').length,
      total: items.length,
    },
    items,
    notes: [
      'Live capacity alerts are computed on read; ack/resolve persists to devops_alerts.',
      'Critical open errors are mirrored here; full taxonomy lives on /devops/errors.',
    ],
  };
}

export async function updateAlertStatus(fingerprint, status) {
  const fp = String(fingerprint || '').slice(0, 200);
  if (!fp) return null;
  if (!['open', 'ack', 'resolved'].includes(status)) return null;

  const existing = await DevopsAlert.findOne({ fingerprint }).lean();
  const now = new Date();

  // Seed from unified view if first ack on an ephemeral alert
  let seed = existing;
  if (!seed) {
    const unified = await getUnifiedAlerts({ status: 'all' });
    seed = unified.items.find((i) => i.fingerprint === fp) || null;
  }

  if (!seed && !existing) return null;

  const doc = await DevopsAlert.findOneAndUpdate(
    { fingerprint: fp },
    {
      $set: {
        severity: seed?.severity || existing?.severity || 'warning',
        source: seed?.source || existing?.source || 'system',
        title: seed?.title || existing?.title || fp,
        cause: seed?.cause || existing?.cause || '',
        impact: seed?.impact || existing?.impact || '',
        action: seed?.action || existing?.action || '',
        eta: seed?.eta ?? existing?.eta ?? null,
        resource: seed?.resource || existing?.resource || '',
        meta: seed?.meta || existing?.meta || {},
        status,
        lastSeenAt: now,
        resolvedAt: status === 'resolved' ? now : null,
      },
      $setOnInsert: {
        fingerprint: fp,
        firstSeenAt: seed?.firstSeenAt || now,
      },
    },
    { upsert: true, new: true }
  ).lean();

  return doc;
}
