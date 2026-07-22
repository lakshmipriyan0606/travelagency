import mongoose from "mongoose";
import * as websiteHeroRepository from "./websiteHero.repository.js";
import { normalizeImages } from "./websiteHero.validation.js";
import { DEFAULT_HERO_TITLE } from "./websiteHero.constants.js";

export const getActiveHeroService = async () => {
  const hero = await websiteHeroRepository.findActive();

  if (!hero) {
    return {
      title: DEFAULT_HERO_TITLE,
      description: "",
      backgroundImages: [],
    };
  }

  return {
    _id: hero._id,
    title: hero.title || "",
    description: hero.description || "",
    backgroundImages: normalizeImages(hero.backgroundImages),
  };
};

export const getAllHeroesService = async () => {
  return await websiteHeroRepository.findAllSorted();
};

export const createHeroService = async (body) => {
  const { title, description, backgroundImages, isActive } = body || {};
  const images = normalizeImages(backgroundImages);

  if (!images.length) {
    const error = new Error("At least one background image is required");
    error.statusCode = 400;
    throw error;
  }

  return await websiteHeroRepository.create({
    title: (title ?? "").toString(),
    description: (description ?? "").toString(),
    backgroundImages: images,
    isActive: isActive === undefined ? true : Boolean(isActive),
  });
};

export const updateHeroService = async (id, body) => {
  if (!mongoose.isValidObjectId(id)) {
    const error = new Error("Invalid id");
    error.statusCode = 400;
    throw error;
  }

  const { title, description, backgroundImages, isActive } = body || {};
  const update = {};
  if (title !== undefined) update.title = (title ?? "").toString();
  if (description !== undefined) update.description = (description ?? "").toString();
  if (backgroundImages !== undefined) {
    const images = normalizeImages(backgroundImages);
    if (!images.length) {
      const error = new Error("At least one background image is required");
      error.statusCode = 400;
      throw error;
    }
    update.backgroundImages = images;
  }
  if (isActive !== undefined) update.isActive = Boolean(isActive);

  const doc = await websiteHeroRepository.findByIdAndUpdate(id, update);
  if (!doc) {
    const error = new Error("Hero not found");
    error.statusCode = 404;
    throw error;
  }
  return doc;
};

export const deleteHeroService = async (id) => {
  if (!mongoose.isValidObjectId(id)) {
    const error = new Error("Invalid id");
    error.statusCode = 400;
    throw error;
  }

  const doc = await websiteHeroRepository.findByIdAndDelete(id);
  if (!doc) {
    const error = new Error("Hero not found");
    error.statusCode = 404;
    throw error;
  }
  return doc;
};
