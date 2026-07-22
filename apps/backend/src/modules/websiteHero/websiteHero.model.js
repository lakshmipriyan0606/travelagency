import mongoose from "mongoose";

const websiteHeroSchema = new mongoose.Schema(
  {
    title: { type: String, default: "Best Travel Agency in Malaysia" },
    description: { type: String, default: "" },
    backgroundImages: [
      {
        url: { type: String, required: true },
        alt: { type: String, default: "" },
      },
    ],
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const WebsiteHero = mongoose.models.WebsiteHero || mongoose.model("WebsiteHero", websiteHeroSchema);
export default WebsiteHero;
