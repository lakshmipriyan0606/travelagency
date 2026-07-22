import mongoose from "mongoose";

let agendaInstance = null;
let agendaMarkedStartedAt = null;

/** Call once from server.js after `await agenda.start()`. */
export function markAgendaWorkerStarted(agenda) {
  agendaInstance = agenda;
  agendaMarkedStartedAt = new Date();
}

export function getQueuePublicSnapshot() {
  return {
    mongoConnected: mongoose.connection.readyState === 1,
    agendaWorkerStarted: Boolean(agendaInstance),
    agendaMarkedStartedAt: agendaMarkedStartedAt
      ? agendaMarkedStartedAt.toISOString()
      : null,
  };
}

/**
 * Detailed queue + job collection stats (for admin / token access only).
 */
export async function getQueueHealthDetail() {
  const snapshot = {
    timestamp: new Date().toISOString(),
    ...getQueuePublicSnapshot(),
    mongooseReadyState: mongoose.connection.readyState,
    collection: "agendaJobs",
    jobs: {},
    recentFailures: [],
    note: null,
  };

  if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
    snapshot.note = "MongoDB not connected; job stats unavailable";
    return snapshot;
  }

  try {
    const col = mongoose.connection.db.collection("agendaJobs");
    const names = [
      "process booking integrations",
      "send booking email",
      "send welcome email",
      "send enquiry email",
    ];

    for (const name of names) {
      const total = await col.countDocuments({ name });
      const withFailureHistory = await col.countDocuments({
        name,
        failCount: { $gt: 0 },
      });
      snapshot.jobs[name] = { total, withFailureHistory };
    }

    const recentFailures = await col
      .find({ failCount: { $gt: 0 } })
      .sort({ lastFinishedAt: -1 })
      .limit(10)
      .project({
        name: 1,
        failCount: 1,
        lastFinishedAt: 1,
        failedAt: 1,
        failReason: 1,
      })
      .toArray();

    snapshot.recentFailures = recentFailures.map((d) => ({
      name: d.name,
      failCount: d.failCount,
      lastFinishedAt: d.lastFinishedAt || d.failedAt || null,
      reason: d.failReason ? String(d.failReason).slice(0, 500) : null,
    }));
  } catch (e) {
    snapshot.note = `Job stats error: ${e.message}`;
  }

  return snapshot;
}
