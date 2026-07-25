import * as z from "zod";

export const destinationSchema = z.object({
  title: z.string().min(2, "Title is too short"),
  location: z.string().min(1, "Please select a target city"),
  url: z.string().url("Please upload or provide a valid image URL"),
  alt: z.string().optional(),
});

export type DestinationFormValues = z.infer<typeof destinationSchema>;

export interface Destination extends DestinationFormValues {
  _id: string;
  orderNumber: number;
  Location?: string; // Legacy casing compatibility
}
