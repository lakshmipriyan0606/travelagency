import axiosClient from '@travelagency/api-client';
import { ENDPOINTS } from '@/lib/endpoints';

export const createBlog = async (payload: FormData) => {
  const { data } = await axiosClient.post("admin/blogs", payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

export const updateBlog = async (id: string, payload: FormData) => {
  const { data } = await axiosClient.put(`admin/blogs/${id}`, payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

export const deleteBlog = async (id: string) => {
  const { data } = await axiosClient.delete(`admin/blogs/${id}`);
  return data;
};

export const getAdminBlogs = async ({ limit = 10, lastId = "", search = "", status = "" }) => {
  const { data } = await axiosClient.get(ENDPOINTS.client.blogs, {
    params: { limit, lastId, search, status },
  });
  return data;
};

export const getBlogById = async (id: string) => {
  const { data } = await axiosClient.get(`admin/blogs/admin/${id}`);
  return data;
};

export const toggleBlogLike = async (id: string, userId: string) => {
  const { data } = await axiosClient.post(ENDPOINTS.client.blogLike(id), {}, {
    headers: { userId }
  });
  return data;
};

export const getPublicBlogs = async ({ limit = 10, lastId = "", search = "", category = "", sortBy = "" }) => {
  const { data } = await axiosClient.get(ENDPOINTS.client.blogs, {
    params: { limit, lastId, search, category, sortBy, status: "Published" },
  });
  return data;
};

export const getBlogBySlug = async (slug: string) => {
  const { data } = await axiosClient.get(ENDPOINTS.client.blogBySlug(slug));
  return data;
};
