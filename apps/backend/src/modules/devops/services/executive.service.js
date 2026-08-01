import mongoose from 'mongoose';
import os from 'os';
import cache from '#config/cache.js';
import { getQueuePublicSnapshot } from '#config/queueRuntime.js';
import ApiHit from '#b2c/analytics/apiHit.model.js';
import Visitor from '#b2c/analytics/visitor.model.js';
import DevopsRequestLog from '../models/devopsRequestLog.model.js';
import DevopsErrorEvent from '../models/devopsErrorEvent.model.js';

function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

async function redisPing() {
  try {
    const pong = await cache.ping();
    return pong === 'PONG' ? 'up' : 'degraded';
  } catch {
    return 'down';
  }
}

export async function getInfraHealth() {
  const mongoState = mongoose.connection.readyState;
  const mongo = mongoState === 1 ? 'up' : mongoState === 2 ? 'connecting' : 'down';
  const redis = await redisPing();
  const queue = getQueuePublicSnapshot();
  const mem = process.memoryUsage();
  return {
    mongo,
    redis,
    queue,
    server: {
      uptimeSec: Math.round(process.uptime()),
      node: process.version,
      heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
      rssMb: Math.round(mem.rss / 1024 / 1024),
      loadAvg: os.loadavg?.() || [],
      freeMemMb: Math.round(os.freemem() / 1024 / 1024),
      totalMemMb: Math.round(os.totalmem() / 1024 / 1024),
    },
    overall:
      mongo === 'up' && redis !== 'down' ? 'healthy' : mongo === 'up' ? 'degraded' : 'critical',
  };
}

export async function getAppsHealth() {
  const since = new Date(Date.now() - 15 * 60 * 1000);
  const byApp = await DevopsRequestLog.aggregate([
    { $match: { ts: { $gte: since } } },
    {
      $group: {
        _id: '$app',
        requests: { $sum: 1 },
        errors: { $sum: { $cond: [{ $gte: ['$status', 500] }, 1, 0] } },
        avgMs: { $avg: '$durationMs' },
      },
    },
  ]);
  const map = Object.fromEntries(byApp.map((r) => [r._id, r]));
  const mk = (app) => {
    const row = map[app];
    if (!row) return { app, status: 'unknown', requests: 0, errors: 0, avgMs: 0 };
    const errRate = row.requests ? row.errors / row.requests : 0;
    const status = errRate > 0.05 ? 'red' : errRate > 0.01 || row.avgMs > 1500 ? 'yellow' : 'green';
    return {
      app,
      status,
      requests: row.requests,
      errors: row.errors,
      avgMs: Math.round(row.avgMs || 0),
    };
  };
  return {
    b2c: mk('b2c'),
    b2b: mk('b2b'),
    admin: mk('admin'),
    api: mk('system'),
  };
}

export async function getExecutiveSummary({ from, to } = {}) {
  const start = from ? new Date(from) : new Date(Date.now() - 24 * 60 * 60 * 1000);
  const end = to ? new Date(to) : new Date();
  const date = todayUtc();

  const [infra, apps, reqAgg, openErrors, todayHits, todayVisitors] = await Promise.all([
    getInfraHealth(),
    getAppsHealth(),
    DevopsRequestLog.aggregate([
      { $match: { ts: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          errors: { $sum: { $cond: [{ $gte: ['$status', 400] }, 1, 0] } },
          avgMs: { $avg: '$durationMs' },
        },
      },
    ]),
    DevopsErrorEvent.countDocuments({ status: 'open' }),
    ApiHit.aggregate([{ $match: { date } }, { $group: { _id: null, count: { $sum: '$count' } } }]),
    Visitor.countDocuments({ date }),
  ]);

  const total = reqAgg[0]?.total || 0;
  const errors = reqAgg[0]?.errors || 0;
  const successRate = total ? ((total - errors) / total) * 100 : 100;
  const errorRate = total ? (errors / total) * 100 : 0;

  return {
    overallHealth: infra.overall,
    apps,
    infra,
    kpis: {
      activeUsersApprox: todayVisitors,
      onlineUsersApprox: todayVisitors,
      activeSessionsApprox: todayVisitors,
      todaysRequests: todayHits[0]?.count || total,
      sampledRequests: total,
      successRate: Number(successRate.toFixed(2)),
      errorRate: Number(errorRate.toFixed(2)),
      avgResponseMs: Math.round(reqAgg[0]?.avgMs || 0),
      openErrors,
      warningCount: apps.b2c.status === 'yellow' || apps.b2b.status === 'yellow' ? 1 : 0,
      criticalAlertCount: infra.overall === 'critical' ? 1 : 0,
    },
    range: { from: start.toISOString(), to: end.toISOString() },
  };
}
