import * as z from "zod";
import { packageFormSchema } from "../validation/package.schema";

export type PackageFormValues = z.infer<typeof packageFormSchema>;

export interface UploadResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface Highlight {
  item: string;
}

export interface Slot {
  slotType: string;
  title: string;
  description: string;
  imageUrl?: File | string;
  imageAlt?: string;
}

export interface ItineraryItem {
  dayTitle: string;
  slots: Slot[];
}
