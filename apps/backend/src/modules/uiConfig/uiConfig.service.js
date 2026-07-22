import * as uiConfigRepository from "./uiConfig.repository.js";
import { normalizeImages } from "./uiConfig.validation.js";
import { DEFAULT_HERO_TITLE } from "./uiConfig.constants.js";

export const getWebsiteHeroConfigService = async () => {
  const doc = await uiConfigRepository.findDefaultConfig();
  const hero = doc?.websiteHero || {};
  return {
    title: hero.title || DEFAULT_HERO_TITLE,
    description: hero.description || "",
    backgroundImages: normalizeImages(hero.backgroundImages, hero.backgroundImageUrl),
  };
};

export const updateWebsiteHeroConfigService = async (body) => {
  const { title, description, backgroundImages, backgroundImageUrl } = body || {};
  const payload = {
    title: (title ?? "").toString(),
    description: (description ?? "").toString(),
    backgroundImages: normalizeImages(backgroundImages, backgroundImageUrl),
  };

  const updated = await uiConfigRepository.updateWebsiteHeroConfig(payload);
  return updated.websiteHero;
};
