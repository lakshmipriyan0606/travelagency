import * as z from "zod";

export const storySchema = z.object({
  url: z.string().url("Please upload or provide a valid image URL"),
  alt: z.string().min(2, "Description is too short"),
  row: z.number().min(1).max(2),
});

export type StoryFormValues = z.infer<typeof storySchema>;

export interface Story extends StoryFormValues {
  _id: string;
  createdAt: string;
  updatedAt: string;
}
