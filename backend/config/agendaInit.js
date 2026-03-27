import { Agenda } from "agenda";
import { MongoBackend } from "@agendajs/mongo-backend";
import mongoose from "mongoose";

/**
 * Creates Agenda once MongoDB is connected. Handles the case where the connection
 * is already open when this runs (otherwise agendaReady never resolves).
 */
export function createAgendaWhenConnected(resolve, reject) {
  const init = () => {
    try {
      const agenda = new Agenda({
        backend: new MongoBackend({
          mongo: mongoose.connection.getClient().db(),
          collection: "agendaJobs",
        }),
        processEvery: "10 seconds",
        maxConcurrency: 5,
      });

      agenda.on("error", (err) =>
        console.error("❌ Agenda connection error:", err)
      );

      console.log("✅ Agenda (Job Queue) connected to MongoDB via Mongoose");
      resolve(agenda);
    } catch (err) {
      reject(err);
    }
  };

  if (mongoose.connection.readyState === 1) {
    init();
  } else {
    mongoose.connection.once("connected", init);
  }
}
