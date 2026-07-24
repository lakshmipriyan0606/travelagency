import * as z from "zod";

export const faqSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
});

export const blogFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  category: z.string().min(1, "Category is required"),
  author: z.string().optional(),
  miniDescription: z.string().optional(),
  readTime: z.string().optional(),
  isFeatured: z.boolean().default(false),
  faqs: z.array(faqSchema).optional(),
});
