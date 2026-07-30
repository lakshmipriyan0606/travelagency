import axiosClient from '@/lib/apiClient';
import { ENDPOINTS } from '@/lib/endpoints';

/** sendSuccess puts arrays under `.data`; objects are flattened onto the envelope. */
function unwrapList<T>(payload: unknown): T[] {
    if (Array.isArray(payload)) return payload as T[];
    if (payload && typeof payload === "object" && Array.isArray((payload as { data?: unknown }).data)) {
        return (payload as { data: T[] }).data;
    }
    return [];
}

export const getStories = async () => {
    const { data } = await axiosClient.get(ENDPOINTS.client.stories.public);
    return unwrapList(data);
};

export const createStory = async (storyData: any) => {
    const { data } = await axiosClient.post(ENDPOINTS.client.stories.list, storyData);
    return data;
};

export const deleteStory = async (id: string) => {
    const { data } = await axiosClient.delete(ENDPOINTS.client.stories.byId(id));
    return data;
};

export const moveStory = async ({ id, direction }: { id: string, direction: "up" | "down" }) => {
    const { data } = await axiosClient.post(ENDPOINTS.client.stories.move(id), { direction });
    return data;
};

export const normalizeStoriesOrder = async () => {
    const { data } = await axiosClient.post(ENDPOINTS.client.stories.normalize);
    return data;
};
