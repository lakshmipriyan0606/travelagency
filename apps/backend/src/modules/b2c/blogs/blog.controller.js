/**
 * ============================================================================
 * Blog Controller
 * ============================================================================
 *
 * Layer:
 * Controller / Interface Adapter
 *
 * Responsibility:
 * Processes HTTP requests for blog operations. Handles multipart/form-data
 * for image uploads via Multer.
 *
 * Called By:
 * src/modules/blogs/blog.b2c.routes.js
 * src/modules/blogs/blog.admin.routes.js
 *
 * Depends On:
 * src/modules/blogs/blog.service.js
 * ============================================================================
 */
import * as blogService from './blog.service.js';
import { sendSuccess } from '#shared/utils/response.js';

export const createBlog = async (req, res, next) => {
  try {
    const blog = await blogService.createBlogService(req.body, req.files, req.user?._id);
    return sendSuccess(res, 201, 'Blog created successfully', { data: blog });
  } catch (error) {
    next(error);
  }
};

export const getAllBlogs = async (req, res, next) => {
  try {
    const blogs = await blogService.getAllBlogsService(req.query);
    return sendSuccess(res, 200, 'Blogs fetched successfully', { data: blogs });
  } catch (error) {
    next(error);
  }
};

export const getBlogBySlug = async (req, res, next) => {
  try {
    const blog = await blogService.getBlogBySlugService(req.params.slug);
    return sendSuccess(res, 200, 'Blog fetched successfully', { data: blog });
  } catch (error) {
    next(error);
  }
};

export const getBlogById = async (req, res, next) => {
  try {
    const blog = await blogService.getBlogByIdService(req.params.id);
    return sendSuccess(res, 200, 'Blog fetched successfully', { data: blog });
  } catch (error) {
    next(error);
  }
};

export const updateBlog = async (req, res, next) => {
  try {
    const updatedBlog = await blogService.updateBlogService(req.params.id, req.body, req.files);
    return sendSuccess(res, 200, 'Blog updated successfully', { data: updatedBlog });
  } catch (error) {
    next(error);
  }
};

export const deleteBlog = async (req, res, next) => {
  try {
    await blogService.deleteBlogService(req.params.id);
    return sendSuccess(res, 200, 'Blog deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const toggleLike = async (req, res, next) => {
  try {
    const userId = req.headers.userid || req.headers.userId || req.body.userId;
    const result = await blogService.toggleLikeService(req.params.id, userId);
    return sendSuccess(res, 200, 'Like toggled', result);
  } catch (error) {
    next(error);
  }
};
