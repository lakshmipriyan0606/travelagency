/**
 * Queue monitoring — Agenda via getQueueHealthDetail; BullMQ honest gap.
 */
import { getQueueHealthDetail, getQueuePublicSnapshot } from '#config/queueRuntime.js';

export async function getQueueMonitorSummary() {
  const [detail, snapshot] = await Promise.all([
    getQueueHealthDetail(),
    Promise.resolve(getQueuePublicSnapshot()),
  ]);

  const jobs = detail?.jobs || {};
  const jobRows = Object.entries(jobs).map(([name, stats]) => ({
    name,
    total: stats?.total ?? null,
    withFailureHistory: stats?.withFailureHistory ?? null,
  }));

  const totals = jobRows.reduce(
    (acc, j) => {
      if (typeof j.total === 'number') acc.total += j.total;
      if (typeof j.withFailureHistory === 'number') {
        acc.withFailureHistory += j.withFailureHistory;
      }
      return acc;
    },
    { total: 0, withFailureHistory: 0 }
  );

  const agendaAvailable =
    detail && !detail.note?.includes('not connected') && detail.mongooseReadyState === 1;

  return {
    collectedAt: new Date().toISOString(),
    agenda: {
      available: Boolean(agendaAvailable),
      reason: agendaAvailable ? null : detail?.note || 'Agenda job stats unavailable',
      workerStarted: Boolean(snapshot.agendaWorkerStarted),
      workerStartedAt: snapshot.agendaMarkedStartedAt,
      mongoConnected: snapshot.mongoConnected,
      collection: detail?.collection || 'agendaJobs',
      totals,
      jobs: jobRows,
      recentFailures: detail?.recentFailures || [],
    },
    bullmq: {
      available: false,
      reason:
        'bullmq is a package dependency but no Queue producers/consumers are wired in this codebase.',
    },
  };
}
