import axiosClient from '@/lib/apiClient';
import { Review, ReviewFormValues } from "../validation/review.schema";
import { ENDPOINTS } from "@/lib/endpoints";

export const getAdminReviews = async (): Promise<Review[]> => {
    const response = await axiosClient.get(ENDPOINTS.client.reviews.adminList);
    return response.data;
};

export const createReview = async (data: ReviewFormValues & { orderNumber: number }): Promise<Review> => {
    const response = await axiosClient.post(ENDPOINTS.client.reviews.create, data);
    return response.data;
};

export const updateReview = async (id: string, data: ReviewFormValues): Promise<Review> => {
    const response = await axiosClient.put(ENDPOINTS.client.reviews.byId(id), data);
    return response.data;
};

export const deleteReview = async (id: string): Promise<{ message: string }> => {
    const response = await axiosClient.delete(ENDPOINTS.client.reviews.byId(id));
    return response.data;
};

export const moveReview = async (id: string, direction: "up" | "down"): Promise<{ message: string }> => {
    const response = await axiosClient.post(ENDPOINTS.client.reviews.move(id), { direction });
    return response.data;
};

export const normalizeReviewsOrder = async (): Promise<{ message: string }> => {
    const response = await axiosClient.post(ENDPOINTS.client.reviews.normalize, {});
    return response.data;
};
