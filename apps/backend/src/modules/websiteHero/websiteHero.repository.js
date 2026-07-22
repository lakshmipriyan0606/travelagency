import WebsiteHero from "./websiteHero.model.js";

export const create = async (data) => {
  return await WebsiteHero.create(data);
};

export const findActive = async () => {
  return (
    (await WebsiteHero.findOne({ isActive: true }).sort({ updatedAt: -1 }).lean()) ||
    (await WebsiteHero.findOne({}).sort({ updatedAt: -1 }).lean())
  );
};

export const findAllSorted = async () => {
  return await WebsiteHero.find({}).sort({ isActive: -1, updatedAt: -1 }).lean();
};

export const findByIdAndUpdate = async (id, updateData) => {
  return await WebsiteHero.findByIdAndUpdate(id, { $set: updateData }, { new: true }).lean();
};

export const findByIdAndDelete = async (id) => {
  return await WebsiteHero.findByIdAndDelete(id).lean();
};
