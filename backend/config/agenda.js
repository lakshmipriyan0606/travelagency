import dotenv from "dotenv";
import { createAgendaWhenConnected } from "./agendaInit.js";

dotenv.config();

const agendaReady = new Promise((resolve, reject) => {
  createAgendaWhenConnected(resolve, reject);
});

export { agendaReady };
