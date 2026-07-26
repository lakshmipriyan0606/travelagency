/**
 * ============================================================================
 * Blog Service
 * ============================================================================
 *
 * Layer:
 * Business Service
 *
 * Responsibility:
 * Processes operations for blogs. Parses nested JSON fields (FAQs), manages
 * direct Cloudinary image uploads from buffers, handles complex search and
 * sorting filters, and manages the like/unlike toggling mechanism.
 *
 * Called By:
 * src/modules/blogs/blog.controller.js
 *
 * Depends On:
 * src/modules/blogs/blog.repository.js
 * src/config/cloudinary.js
 * ============================================================================
 */
import * as blogRepository from './blog.repository.js';
import cloudinary from '#config/cloudinary.js';
import { AppError } from '#shared/errors/AppError.js';

const uploadFile = (file, folder) =>
  new Promise((resolve, reject) => {
    try {
      const stream = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
        if (err) return reject(err);
        resolve(result && result.secure_url ? result.secure_url : null);
      });
      stream.end(file.buffer);
    } catch (err) {
      reject(err);
    }
  });

export const createBlogService = async (body, files, userId) => {
  const {
    title,
    category,
    author,
    miniDescription,
    content,
    slug,
    status,
    thumbnailImageAlt,
    thumbnailImageUrl,
    bannerImageAlt,
    bannerImageUrl,
    faqs,
  } = body;

  let parsedFaqs = [];
  if (faqs) {
    try {
      parsedFaqs = typeof faqs === 'string' ? JSON.parse(faqs) : faqs;
    } catch (e) {
      console.error('Error parsing FAQs:', e);
    }
  }

  // Generate safe slug if none provided
  const blogData = {
    title,
    category,
    author,
    miniDescription,
    content,
    status: status || 'Draft',
    slug:
      slug ||
      title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, ''),
    createdBy: userId,
    likes: [],
    faqs: parsedFaqs,
  };

  const fileList = Array.isArray(files) ? files : [];
  const thumbnailFile = fileList.find((f) => f.fieldname === 'thumbnailImage');
  const bannerFile = fileList.find((f) => f.fieldname === 'bannerImage');

  if (thumbnailFile) {
    const url = await uploadFile(thumbnailFile, 'blogs/thumbnails');
    if (url) blogData.thumbnailImage = { url, alt: thumbnailImageAlt || title };
  } else if (thumbnailImageUrl) {
    blogData.thumbnailImage = { url: thumbnailImageUrl, alt: thumbnailImageAlt || title };
  }

  if (bannerFile) {
    const url = await uploadFile(bannerFile, 'blogs/banners');
    if (url) blogData.bannerImage = { url, alt: bannerImageAlt || title };
  } else if (bannerImageUrl) {
    blogData.bannerImage = { url: bannerImageUrl, alt: bannerImageAlt || title };
  }

  try {
    return await blogRepository.create(blogData);
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError('Slug already exists. Please choose a different title or slug.', 400);
    }
    throw error;
  }
};

export const getAllBlogsService = async (queryParams) => {
  const { status, limit, lastId, search, category, sortBy } = queryParams;

  let query = { isDeleted: false };
  if (status) query.status = status;
  if (category) query.category = { $regex: category, $options: 'i' };

  if (lastId) {
    query._id = { $lt: lastId };
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
    ];
  }

  let sortOption = { _id: -1 };
  if (sortBy === 'likes') {
    sortOption = { 'likes.length': -1, _id: -1 };
  }

  return await blogRepository.find(query, sortOption, limit ? parseInt(limit) : 10, {
    path: 'createdBy',
    select: 'name email',
  });
};

export const getBlogBySlugService = async (slug) => {
  const sanitizedSlug = slug
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const blog = await blogRepository.findOne(
    { slug: sanitizedSlug, isDeleted: false, status: 'Published' },
    { path: 'createdBy', select: 'name email' }
  );

  if (!blog) {
    const error = new Error('Blog not found');
    error.statusCode = 404;
    throw error;
  }
  return blog;
};

export const getBlogByIdService = async (id) => {
  const blog = await blogRepository.findById(id);
  if (!blog || blog.isDeleted) {
    const error = new Error('Blog not found');
    error.statusCode = 404;
    throw error;
  }
  return blog;
};

export const updateBlogService = async (id, body, files) => {
  const {
    title,
    slug,
    category,
    author,
    miniDescription,
    content,
    status,
    thumbnailImageAlt,
    thumbnailImageUrl,
    bannerImageAlt,
    bannerImageUrl,
    faqs,
  } = body;

  const blogToUpdate = await blogRepository.findById(id);
  if (!blogToUpdate || blogToUpdate.isDeleted) {
    const error = new Error('Blog not found');
    error.statusCode = 404;
    throw error;
  }

  let parsedFaqs = blogToUpdate.faqs;
  if (faqs) {
    try {
      parsedFaqs = typeof faqs === 'string' ? JSON.parse(faqs) : faqs;
    } catch (e) {
      console.error('Error parsing FAQs:', e);
    }
  }

  const updateData = {
    title,
    category,
    author,
    miniDescription,
    content,
    status: status || blogToUpdate.status,
    slug: (slug || blogToUpdate.slug)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, ''),
    faqs: parsedFaqs,
  };

  const fileList = Array.isArray(files) ? files : [];
  const thumbnailFile = fileList.find((f) => f.fieldname === 'thumbnailImage');
  const bannerFile = fileList.find((f) => f.fieldname === 'bannerImage');

  if (thumbnailFile) {
    const url = await uploadFile(thumbnailFile, 'blogs/thumbnails');
    if (url)
      updateData.thumbnailImage = { url, alt: thumbnailImageAlt || title || blogToUpdate.title };
  } else if (thumbnailImageUrl) {
    updateData.thumbnailImage = {
      url: thumbnailImageUrl,
      alt: thumbnailImageAlt || title || blogToUpdate.title,
    };
  } else if (thumbnailImageAlt) {
    updateData.thumbnailImage = {
      url: blogToUpdate.thumbnailImage?.url || '',
      alt: thumbnailImageAlt,
    };
  }

  if (bannerFile) {
    const url = await uploadFile(bannerFile, 'blogs/banners');
    if (url) updateData.bannerImage = { url, alt: bannerImageAlt || title || blogToUpdate.title };
  } else if (bannerImageUrl) {
    updateData.bannerImage = {
      url: bannerImageUrl,
      alt: bannerImageAlt || title || blogToUpdate.title,
    };
  } else if (bannerImageAlt) {
    updateData.bannerImage = {
      url: blogToUpdate.bannerImage?.url || '',
      alt: bannerImageAlt,
    };
  }

  try {
    return await blogRepository.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError('Slug already exists. Please choose a different title or slug.', 400);
    }
    throw error;
  }
};

/**
 * Soft deletes the blog to preserve database integrity and prevent broken links.
 */
export const deleteBlogService = async (id) => {
  const blog = await blogRepository.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  if (!blog) {
    const error = new Error('Blog not found');
    error.statusCode = 404;
    throw error;
  }
  return blog;
};

/**
 * Idempotently toggles a user's like on a blog post.
 */
export const toggleLikeService = async (id, userId) => {
  if (!userId) {
    const error = new Error('User ID is required (header or body)');
    error.statusCode = 400;
    throw error;
  }

  const blog = await blogRepository.findById(id);
  if (!blog || blog.isDeleted || blog.status !== 'Published') {
    const error = new Error('Blog not found');
    error.statusCode = 404;
    throw error;
  }

  const existingLikeIndex = blog.likes.findIndex(
    (like) => like.userId?.toString() === userId.toString()
  );

  if (existingLikeIndex > -1) {
    blog.likes.splice(existingLikeIndex, 1);
    await blog.save();
    return { message: 'Blog unliked', liked: false, totalLikes: blog.likes.length };
  } else {
    blog.likes.push({ userId, liked: true });
    await blog.save();
    return { message: 'Blog liked', liked: true, totalLikes: blog.likes.length };
  }
};
