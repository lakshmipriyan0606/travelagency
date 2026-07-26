import * as z from "zod";

export const slotSchema = z.object({
  slotType: z.string(),
  title: z.string(),
  description: z.string(),
  imageUrl: z.any().optional(),
  imageAlt: z.string().optional(),
});

export const daySchema = z.object({
  dayTitle: z.string(),
  slots: z.array(slotSchema),
});

export const packageFormSchema = z.object({
  type: z.enum(["package", "activity"]).optional(),
  packageName: z.string().min(1, "Required"),
  packageDescription: z.string().min(1, "Required"),
  location: z.string().min(1, "Required"),
  packageType: z.string().optional(),
  daysAndNights: z.string().min(1, "Required"),
  hotelName: z.string().optional(),
  price: z.string().optional(), // Make optional to allow activities to submit
  offerPrice: z.string().optional(),
  isBestPackage: z.boolean(),
  bestRank: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  isActive: z.boolean().default(true),
  status: z.enum(["Active", "Inactive"]).default("Active"),
  activityCategory: z.string().optional(),
  days: z.array(daySchema).optional(), // Make optional for activities
  operatingHours: z.string().optional(),
  isInstantConfirmation: z.boolean().default(false),
  isNonRefundable: z.boolean().default(false),
  languages: z.string().optional(),
  highlights: z.array(z.object({ item: z.string() })).default([]),
  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.string().optional(),
  }).optional(),
});
