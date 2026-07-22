import axiosClient from "../axiosClient";

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

export const getAdminBlogs = async ({ limit = 10, lastId = "", search = "", status = "" }) => {
  const { data } = await axiosClient.get("/blogs", {
    params: { limit, lastId, search, status },
  });
  return data;
};

export const getBlogById = async (id: string) => {
  const { data } = await axiosClient.get(`/blogs/admin/${id}`);
  return data;
};

export const toggleBlogLike = async (id: string, userId: string) => {
  const { data } = await axiosClient.post(`/blogs/${id}/like`, {}, {
    headers: { userId }
  });
  return data;
};

export const getPublicBlogs = async ({ limit = 10, lastId = "", search = "", category = "", sortBy = "" }) => {
  const { data } = await axiosClient.get("/blogs", {
    params: { limit, lastId, search, category, sortBy, status: "Published" },
  });
  return data;
};

export const getBlogBySlug = async (slug: string) => {
  const { data } = await axiosClient.get(`/blogs/${slug}`);
  return data;
};
