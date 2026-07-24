import * as z from "zod";
import { blogFormSchema } from "../validation/blog.schema";

export type BlogFormValues = z.infer<typeof blogFormSchema>;

export interface FAQ {
  question: string;
  answer: string;
}

export interface BlogPayload {
  title: string;
  content: string;
  category: string;
  author?: string;
  miniDescription?: string;
  readTime?: string;
  isFeatured: boolean;
  faqs?: FAQ[];
}

export interface Blog extends BlogPayload {
  _id: string;
  slug: string;
  likes: number;
  bannerImage: string;
  createdAt: string;
  updatedAt: string;
}
