import axiosClient from '@travelagency/api-client';

export const getStories = async () => {
    const { data } = await axiosClient.get("/stories");
    return data;
};

export const createStory = async (storyData: any) => {
    const { data } = await axiosClient.post("admin/stories", storyData);
    return data;
};

export const deleteStory = async (id: string) => {
    const { data } = await axiosClient.delete(`admin/stories/${id}`);
    return data;
};

export const moveStory = async ({ id, direction }: { id: string, direction: "up" | "down" }) => {
    const { data } = await axiosClient.post(`admin/stories/${id}/move`, { direction });
    return data;
};

export const normalizeStoriesOrder = async () => {
    const { data } = await axiosClient.post("admin/stories/normalize");
    return data;
};
