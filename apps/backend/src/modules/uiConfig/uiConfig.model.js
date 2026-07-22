import mongoose from "mongoose";

const uiConfigSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    websiteHero: {
      title: { type: String, default: "Best Travel Agency in Malaysia" },
      description: { type: String, default: "" },
      backgroundImages: [
        {
          url: { type: String, default: "" },
          alt: { type: String, default: "" },
        },
      ],
    },
  },
  { timestamps: true }
);

export const UiConfig = mongoose.models.UiConfig || mongoose.model("UiConfig", uiConfigSchema);
export default UiConfig;
