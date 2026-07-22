import UiConfig from "./uiConfig.model.js";
import { CONFIG_KEY } from "./uiConfig.constants.js";

export const findDefaultConfig = async () => {
  return await UiConfig.findOne({ key: CONFIG_KEY }).lean();
};

export const updateWebsiteHeroConfig = async (payload) => {
  return await UiConfig.findOneAndUpdate(
    { key: CONFIG_KEY },
    { $set: { websiteHero: payload } },
    { upsert: true, new: true }
  ).lean();
};
