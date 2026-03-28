import Blog from "../models/Blog.model.js";
import cloudinary from "../config/cloudinary.js";

// Helper to upload buffer to cloudinary using upload_stream
const uploadFile = (file, folder) =>
  new Promise((resolve, reject) => {
    try {
      const stream = cloudinary.uploader.upload_stream(
        { folder },
        (err, result) => {
          if (err) return reject(err);
          resolve(result && result.secure_url ? result.secure_url : null);
        }
      );
      stream.end(file.buffer);
    } catch (err) {
      reject(err);
    }
  });

// CREATE BLOG
export const createBlog = async (req, res) => {
  try {
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
    } = req.body;

    let parsedFaqs = [];
    if (faqs) {
      try {
        parsedFaqs = typeof faqs === "string" ? JSON.parse(faqs) : faqs;
      } catch (e) {
        console.error("Error parsing FAQs:", e);
      }
    }

    const blogData = {
      title,
      category,
      author,
      miniDescription,
      content,
      status: status || "Draft",
      slug: slug || title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, ''),
      createdBy: req.user._id,
      likes: [],
      faqs: parsedFaqs,
    };

    const files = Array.isArray(req.files) ? req.files : [];
    const thumbnailFile = files.find((f) => f.fieldname === "thumbnailImage");
    const bannerFile = files.find((f) => f.fieldname === "bannerImage");

    // Handle Thumbnail
    if (thumbnailFile) {
      const url = await uploadFile(thumbnailFile, "blogs/thumbnails");
      if (url) blogData.thumbnailImage = { url, alt: thumbnailImageAlt || title };
    } else if (thumbnailImageUrl) {
      blogData.thumbnailImage = { url: thumbnailImageUrl, alt: thumbnailImageAlt || title };
    }

    // Handle Banner
    if (bannerFile) {
      const url = await uploadFile(bannerFile, "blogs/banners");
      if (url) blogData.bannerImage = { url, alt: bannerImageAlt || title };
    } else if (bannerImageUrl) {
      blogData.bannerImage = { url: bannerImageUrl, alt: bannerImageAlt || title };
    }

    const blog = new Blog(blogData);
    await blog.save();

    res.status(201).json({
      message: "Blog created successfully",
      data: blog,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Slug already exists. Please choose a different title or slug." });
    }
    console.error("Create blog error:", error);
    res.status(500).json({ error: error.message });
  }
};

// GET ALL BLOGS
export const getAllBlogs = async (req, res) => {
  try {
    const { status, limit, lastId, search, category, sortBy } = req.query;
    
    let query = { isDeleted: false };
    if (status) query.status = status;
    if (category) query.category = { $regex: category, $options: "i" };
    
    // Pagination (Relay-style cursors)
    if (lastId) {
      query._id = { $lt: lastId };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    let sortOption = { _id: -1 };
    if (sortBy === "likes") {
      sortOption = { "likes.length": -1, _id: -1 };
    }

    const blogs = await Blog.find(query)
      .sort(sortOption)
      .limit(limit ? parseInt(limit) : 10)
      .populate("createdBy", "name email");

    res.status(200).json({ data: blogs });
  } catch (error) {
    console.error("Get all blogs error:", error);
    res.status(500).json({ error: error.message });
  }
};

// GET BLOG BY SLUG
export const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const sanitizedSlug = slug.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
    const blog = await Blog.findOne({ slug: sanitizedSlug, isDeleted: false, status: "Published" })
      .populate("createdBy", "name email");

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json({ data: blog });
  } catch (error) {
    console.error("Get blog error:", error);
    res.status(500).json({ error: error.message });
  }
};

// GET BLOG BY ID (Admin)
export const getBlogById = async (req, res) => {
    try {
      const { id } = req.params;
      const blog = await Blog.findById(id);
  
      if (!blog || blog.isDeleted) {
        return res.status(404).json({ message: "Blog not found" });
      }
  
      res.status(200).json({ data: blog });
    } catch (error) {
      console.error("Get blog by id error:", error);
      res.status(500).json({ error: error.message });
    }
};

// UPDATE BLOG
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
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
    } = req.body;

    const blogToUpdate = await Blog.findById(id);
    if (!blogToUpdate || blogToUpdate.isDeleted) {
      return res.status(404).json({ message: "Blog not found" });
    }

    let parsedFaqs = blogToUpdate.faqs;
    if (faqs) {
      try {
        parsedFaqs = typeof faqs === "string" ? JSON.parse(faqs) : faqs;
      } catch (e) {
        console.error("Error parsing FAQs:", e);
      }
    }

    const updateData = {
      title,
      category,
      author,
      miniDescription,
      content,
      status: status || blogToUpdate.status,
      slug: (slug || blogToUpdate.slug).toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, ''),
      faqs: parsedFaqs,
    };

    const files = Array.isArray(req.files) ? req.files : [];
    const thumbnailFile = files.find((f) => f.fieldname === "thumbnailImage");
    const bannerFile = files.find((f) => f.fieldname === "bannerImage");

    // Handle Thumbnail
    if (thumbnailFile) {
      const url = await uploadFile(thumbnailFile, "blogs/thumbnails");
      if (url) updateData.thumbnailImage = { url, alt: thumbnailImageAlt || title || blogToUpdate.title };
    } else if (thumbnailImageUrl) {
      updateData.thumbnailImage = { url: thumbnailImageUrl, alt: thumbnailImageAlt || title || blogToUpdate.title };
    } else if (thumbnailImageAlt) {
      updateData.thumbnailImage = { 
        url: blogToUpdate.thumbnailImage?.url || "", 
        alt: thumbnailImageAlt 
      };
    }

    // Handle Banner
    if (bannerFile) {
      const url = await uploadFile(bannerFile, "blogs/banners");
      if (url) updateData.bannerImage = { url, alt: bannerImageAlt || title || blogToUpdate.title };
    } else if (bannerImageUrl) {
      updateData.bannerImage = { url: bannerImageUrl, alt: bannerImageAlt || title || blogToUpdate.title };
    } else if (bannerImageAlt) {
      updateData.bannerImage = { 
        url: blogToUpdate.bannerImage?.url || "", 
        alt: bannerImageAlt 
      };
    }

    const updatedBlog = await Blog.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    res.status(200).json({
      message: "Blog updated successfully",
      data: updatedBlog,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Slug already exists. Please choose a different title or slug." });
    }
    console.error("Update blog error:", error);
    res.status(500).json({ error: error.message });
  }
};

// DELETE BLOG
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Delete blog error:", error);
    res.status(500).json({ error: error.message });
  }
};

// TOGGLE LIKE
export const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers.userid || req.headers.userId || req.body.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required (header or body)" });
    }

    const blog = await Blog.findById(id);
    if (!blog || blog.isDeleted || blog.status !== "Published") {
      return res.status(404).json({ message: "Blog not found" });
    }

    const existingLikeIndex = blog.likes.findIndex((like) => like.userId?.toString() === userId.toString());

    if (existingLikeIndex > -1) {
      // User already liked, so UNLIKE (remove it)
      blog.likes.splice(existingLikeIndex, 1);
      await blog.save();
      return res.status(200).json({ message: "Blog unliked", liked: false, totalLikes: blog.likes.length });
    } else {
      // User hasn't liked, so LIKE (add it)
      blog.likes.push({ userId, liked: true });
      await blog.save();
      return res.status(200).json({ message: "Blog liked", liked: true, totalLikes: blog.likes.length });
    }
  } catch (error) {
    console.error("Toggle like error:", error);
    res.status(500).json({ error: error.message });
  }
};
