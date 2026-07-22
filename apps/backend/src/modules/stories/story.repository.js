import Story from "./story.model.js";

export const create = async (storyData) => {
  const story = new Story(storyData);
  return await story.save();
};

export const findSorted = async (query = {}, sort = "row orderNumber") => {
  return await Story.find(query).sort(sort);
};

export const findById = async (id) => {
  return await Story.findById(id);
};

export const findOne = async (query, sort = {}) => {
  return await Story.findOne(query).sort(sort);
};

export const deleteById = async (id) => {
  return await Story.findByIdAndDelete(id);
};

export const saveDocument = async (doc) => {
  return await doc.save();
};
