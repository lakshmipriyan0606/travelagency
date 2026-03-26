import { Agenda } from "agenda";
import { MongoBackend } from "@agendajs/mongo-backend";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

let agenda;

const agendaReady = new Promise((resolve, reject) => {
  // Only create Agenda once Mongoose has an active connection
  mongoose.connection.on("connected", () => {
    try {
      agenda = new Agenda({
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
  });
});

export { agendaReady };
export default agenda;
