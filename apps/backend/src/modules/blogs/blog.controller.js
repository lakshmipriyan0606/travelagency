import * as blogService from "./blog.service.js";

export const createBlog = async (req, res) => {
  try {
    const blog = await blogService.createBlogService(req.body, req.files, req.user?._id);
    res.status(201).json({ message: "Blog created successfully", data: blog });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Slug already exists. Please choose a different title or slug." });
    }
    console.error("Create blog error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await blogService.getAllBlogsService(req.query);
    res.status(200).json({ data: blogs });
  } catch (error) {
    console.error("Get all blogs error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getBlogBySlug = async (req, res) => {
  try {
    const blog = await blogService.getBlogBySlugService(req.params.slug);
    res.status(200).json({ data: blog });
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message, error: error.message });
  }
};

export const getBlogById = async (req, res) => {
  try {
    const blog = await blogService.getBlogByIdService(req.params.id);
    res.status(200).json({ data: blog });
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message, error: error.message });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const updatedBlog = await blogService.updateBlogService(req.params.id, req.body, req.files);
    res.status(200).json({ message: "Blog updated successfully", data: updatedBlog });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Slug already exists. Please choose a different title or slug." });
    }
    const status = error.statusCode || 500;
    res.status(status).json({ error: error.message });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    await blogService.deleteBlogService(req.params.id);
    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ error: error.message });
  }
};

export const toggleLike = async (req, res) => {
  try {
    const userId = req.headers.userid || req.headers.userId || req.body.userId;
    const result = await blogService.toggleLikeService(req.params.id, userId);
    res.status(200).json(result);
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ error: error.message, message: error.message });
  }
};
