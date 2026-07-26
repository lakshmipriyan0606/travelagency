import axiosClient from "@/api/axiosClient";
import { Story, StoryFormValues } from "../validation/story.schema";

export const getStories = async (): Promise<Story[]> => {
  const { data } = await axiosClient.get("/admin/stories");
  return data?.data || data || [];
};

export const createStory = async (story: StoryFormValues): Promise<Story> => {
  const { data } = await axiosClient.post("/admin/stories", story);
  return data?.data || data;
};

export const deleteStory = async (id: string): Promise<void> => {
  await axiosClient.delete(`/admin/stories/${id}`);
};

export const moveStory = async ({ id, direction }: { id: string; direction: "up" | "down" }) => {
  const { data } = await axiosClient.post(`/admin/stories/${id}/move`, { direction });
  return data;
};

export const normalizeStoriesOrder = async () => {
  const { data } = await axiosClient.post("/admin/stories/normalize");
  return data;
};
