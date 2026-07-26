import axiosClient from '@travelagency/api-client';
import { Blog } from "../validation/blog.schema";

export const getAdminBlogs = async ({ search = "", status = "" }) => {
  const { data } = await axiosClient.get("/blogs", {
    params: { search, status },
  });
  return data;
};

export const getBlogById = async (id: string): Promise<{ data: Blog }> => {
  const { data } = await axiosClient.get(`/blogs/admin/${id}`);
  return data;
};

export const createBlog = async (payload: FormData) => {
  const { data } = await axiosClient.post("/blogs", payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

export const updateBlog = async (id: string, payload: FormData) => {
  const { data } = await axiosClient.put(`/blogs/${id}`, payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

export const deleteBlog = async (id: string) => {
  const { data } = await axiosClient.delete(`/blogs/${id}`);
  return data;
};
