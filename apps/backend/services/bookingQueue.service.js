import { agendaReady } from "../config/agenda.js";

const AGENDA_READY_TIMEOUT_MS = 2500;

async function agendaWithTimeout() {
  return Promise.race([
    agendaReady,
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Agenda queue is not ready yet")),
        AGENDA_READY_TIMEOUT_MS
      )
    ),
  ]);
}

export const enqueueBookingIntegrations = async (payload) => {
  const agenda = await agendaWithTimeout();
  const job = agenda.create("process booking integrations", payload);
  job.priority("high");
  await job.save();
};
