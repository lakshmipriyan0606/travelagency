import axiosClient from '@/lib/apiClient';
import { Review, ReviewFormValues } from "../validation/review.schema";
import { ENDPOINTS } from "@/lib/endpoints";

/** sendSuccess puts arrays under `.data`; objects are flattened onto the envelope. */
function unwrapList<T>(payload: unknown): T[] {
    if (Array.isArray(payload)) return payload as T[];
    if (payload && typeof payload === "object" && Array.isArray((payload as { data?: unknown }).data)) {
        return (payload as { data: T[] }).data;
    }
    return [];
}

export const getAdminReviews = async (): Promise<Review[]> => {
    const response = await axiosClient.get(ENDPOINTS.client.reviews.adminList);
    return unwrapList<Review>(response.data);
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
