import { z } from "zod";

export const blogSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().optional(),
  category: z.string().min(2, "Category is required"),
  author: z.string().min(2, "Author is required"),
  miniDescription: z.string().min(10, "Mini description must be at least 10 characters"),
  content: z.string().min(20, "Content must be at least 20 characters"),
  thumbnailImageUrl: z.string().optional(),
  thumbnailImageAlt: z.string().optional(),
  bannerImageUrl: z.string().optional(),
  bannerImageAlt: z.string().optional(),
  status: z.enum(["Published", "Draft"]).optional(),
  faqs: z.array(z.object({
    question: z.string().min(5, "Question must be at least 5 characters"),
    answer: z.string().min(5, "Answer must be at least 5 characters"),
  })).optional(),
});

export type BlogFormValues = z.infer<typeof blogSchema>;

export interface Blog extends BlogFormValues {
  _id: string;
  date: string;
  thumbnailImage?: { url: string; alt?: string; public_id?: string };
  bannerImage?: { url: string; alt?: string; public_id?: string };
}
