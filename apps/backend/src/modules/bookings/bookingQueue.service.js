import { agendaReady } from '#config/agenda.js';

export const enqueueBookingIntegrations = async (payload) => {
  try {
    const agenda = await agendaReady;
    await agenda.now('process booking integrations', payload);
  } catch (error) {
    console.error('Failed to enqueue booking integrations:', error);
  }
};
