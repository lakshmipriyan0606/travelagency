import Blog from "./blog.model.js";

export const create = async (blogData) => {
  const blog = new Blog(blogData);
  return await blog.save();
};

export const find = async (query = {}, sortOptions = { _id: -1 }, limit = 10, populate = null) => {
  let req = Blog.find(query).sort(sortOptions).limit(limit);
  if (populate) {
    req = req.populate(populate.path, populate.select);
  }
  return await req;
};

export const findOne = async (query, populate = null) => {
  let req = Blog.findOne(query);
  if (populate) {
    req = req.populate(populate.path, populate.select);
  }
  return await req;
};

export const findById = async (id) => {
  return await Blog.findById(id);
};

export const findByIdAndUpdate = async (id, updateData, options = { new: true, runValidators: true }) => {
  return await Blog.findByIdAndUpdate(id, updateData, options);
};
