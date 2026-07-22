import axiosClient from "../axiosClient";

export const getStories = async () => {
    const { data } = await axiosClient.get("/stories");
    return data;
};

export const createStory = async (storyData: any) => {
    const { data } = await axiosClient.post("/stories", storyData);
    return data;
};

export const deleteStory = async (id: string) => {
    const { data } = await axiosClient.delete(`/stories/${id}`);
    return data;
};

export const moveStory = async ({ id, direction }: { id: string, direction: "up" | "down" }) => {
    const { data } = await axiosClient.post(`/stories/${id}/move`, { direction });
    return data;
};

export const normalizeStoriesOrder = async () => {
    const { data } = await axiosClient.post("/stories/normalize");
    return data;
};
