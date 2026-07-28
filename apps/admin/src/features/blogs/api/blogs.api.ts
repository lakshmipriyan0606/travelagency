import axiosClient from '@/lib/apiClient';
import { Blog } from "../validation/blog.schema";
import { ENDPOINTS } from "@/lib/endpoints";

export const getAdminBlogs = async ({ search = "", status = "" }) => {
  const { data } = await axiosClient.get(ENDPOINTS.client.blogs.list, {
    params: { search, status },
  });
  return data;
};

export const getBlogById = async (id: string): Promise<{ data: Blog }> => {
  const { data } = await axiosClient.get(ENDPOINTS.client.blogs.legacyAdminById(id));
  return data;
};

export const createBlog = async (payload: FormData) => {
  const { data } = await axiosClient.post(ENDPOINTS.client.blogs.list, payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

export const updateBlog = async (id: string, payload: FormData) => {
  const { data } = await axiosClient.put(ENDPOINTS.client.blogs.byId(id), payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

export const deleteBlog = async (id: string) => {
  const { data } = await axiosClient.delete(ENDPOINTS.client.blogs.byId(id));
  return data;
};
