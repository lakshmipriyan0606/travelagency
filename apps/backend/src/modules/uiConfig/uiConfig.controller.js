import * as uiConfigService from "./uiConfig.service.js";

export const getWebsiteHero = async (req, res) => {
  try {
    const data = await uiConfigService.getWebsiteHeroConfigService();
    return res.status(200).json({ data });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch website hero config", error: error.message });
  }
};

export const updateWebsiteHero = async (req, res) => {
  try {
    const data = await uiConfigService.updateWebsiteHeroConfigService(req.body);
    return res.status(200).json({ message: "Website hero updated", data });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update website hero config", error: error.message });
  }
};
