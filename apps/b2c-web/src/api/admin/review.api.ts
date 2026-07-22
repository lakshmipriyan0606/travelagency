import axiosClient from "../axiosClient";

export const createReview = async (payload: any) => {
  const { data } = await axiosClient.post("/reviews", payload);
  return data;
};

export const updateReview = async (id: string, payload: any) => {
  const { data } = await axiosClient.put(`/reviews/${id}`, payload);
  return data;
};

export const deleteReview = async (id: string) => {
  const { data } = await axiosClient.delete(`/reviews/${id}`);
  return data;
};

export const getAdminReviews = async (status?: string) => {
  const { data } = await axiosClient.get("/reviews", {
    params: { status },
  });
  return data;
};

export const moveReview = async (id: string, direction: "up" | "down") => {
  const { data } = await axiosClient.post(`/reviews/${id}/move`, { direction });
  return data;
};

export const normalizeReviewsOrder = async () => {
  const { data } = await axiosClient.post("/reviews/normalize");
  return data;
};

/**
 * Reusable Image Upload targeting Cloudinary 'travelExperience' folder
 */
export const uploadReviewImage = async (file: File) => {
  const formData = new FormData();
  formData.append("image", file);
  // Specify custom folder for travel experiences as requested
  formData.append("folder", "travelExperience");

  const { data } = await axiosClient.post("/upload/image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data; // Returns { url: "..." }
};
