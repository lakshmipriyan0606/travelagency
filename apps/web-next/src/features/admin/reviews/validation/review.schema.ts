import * as z from "zod";

export const reviewSchema = z.object({
  name: z.string().min(2, "Name is required"),
  location: z.string().min(2, "Location is required"),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  content: z.string().min(10, "Review content is too short").max(500, "Review content is too long"),
  status: z.enum(["Published", "Draft"]),
  profileImage: z.object({
    url: z.string().optional(),
    public_id: z.string().optional()
  }).optional()
});

export type ReviewFormValues = z.infer<typeof reviewSchema>;

export interface Review extends ReviewFormValues {
  _id: string;
  orderNumber: number;
}
