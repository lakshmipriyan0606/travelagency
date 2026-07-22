import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import PackageModel from "../models/Package.model.js";

const isActivityByCategory = (activityCategory) => {
  if (activityCategory === null || activityCategory === undefined) return false;
  const v = String(activityCategory).trim();
  if (!v) return false;
  return !/^(none)$/i.test(v);
};

async function run() {
  await connectDB();

  // 1) Fill missing/empty type
  const cursor = PackageModel.find({
    $or: [
      { type: { $exists: false } },
      { type: null },
      { type: "" },
      { type: { $nin: ["package", "activity"] } },
    ],
    isDeleted: { $ne: true },
  })
    .select("_id activityCategory type")
    .lean()
    .cursor();

  let scanned = 0;
  let updated = 0;

  for await (const doc of cursor) {
    scanned += 1;
    const nextType = isActivityByCategory(doc.activityCategory) ? "activity" : "package";
    await PackageModel.updateOne({ _id: doc._id }, { $set: { type: nextType } });
    updated += 1;
  }

  // 2) Normalize category for packages (optional safety)
  const normalized = await PackageModel.updateMany(
    { type: "package", activityCategory: { $ne: null } },
    { $set: { activityCategory: null } }
  );

  console.log(
    JSON.stringify(
      {
        scanned,
        updatedTypeDocs: updated,
        normalizedActivityCategoryDocs: normalized.modifiedCount ?? normalized.nModified ?? 0,
      },
      null,
      2
    )
  );

  await mongoose.connection.close();
}

run().catch(async (err) => {
  console.error("Backfill failed:", err);
  try {
    await mongoose.connection.close();
  } catch {}
  process.exit(1);
});

