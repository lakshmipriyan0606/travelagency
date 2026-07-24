import { z } from "zod";
import { blogSchema } from "../validation/blog.schema";

export type BlogFormValues = z.infer<typeof blogSchema>;

export interface BlogFaq {
  question: string;
  answer: string;
  _id?: string;
}

export interface BlogImage {
  publicId?: string;
  url: string;
  alt?: string;
}

export interface BlogResponse {
  _id: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  miniDescription: string;
  content: string;
  thumbnailImage?: BlogImage;
  bannerImage?: BlogImage;
  faqs?: BlogFaq[];
  status: "Draft" | "Published";
  date: string;
  views: number;
}
