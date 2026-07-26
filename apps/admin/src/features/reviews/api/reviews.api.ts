import axiosClient from '@travelagency/api-client';
import { Review, ReviewFormValues } from "../validation/review.schema";

export const getAdminReviews = async (): Promise<Review[]> => {
    const response = await axiosClient.get(`/reviews/admin`);
    return response.data;
};

export const createReview = async (data: ReviewFormValues & { orderNumber: number }): Promise<Review> => {
    const response = await axiosClient.post(`/reviews`, data);
    return response.data;
};

export const updateReview = async (id: string, data: ReviewFormValues): Promise<Review> => {
    const response = await axiosClient.put(`/reviews/${id}`, data);
    return response.data;
};

export const deleteReview = async (id: string): Promise<{ message: string }> => {
    const response = await axiosClient.delete(`/reviews/${id}`);
    return response.data;
};

export const moveReview = async (id: string, direction: "up" | "down"): Promise<{ message: string }> => {
    const response = await axiosClient.post(`/reviews/${id}/move`, { direction });
    return response.data;
};

export const normalizeReviewsOrder = async (): Promise<{ message: string }> => {
    const response = await axiosClient.post(`/reviews/normalize`, {});
    return response.data;
};
