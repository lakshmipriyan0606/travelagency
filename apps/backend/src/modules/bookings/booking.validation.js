import { z } from 'zod';

export const createBookingSchema = z
  .object({
    email: z.string().email('Valid email is required'),
    name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
    destination: z.string().min(1, 'Destination is required'),
    city: z.string().optional(),
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
    travelDate: z.string().optional(),
    travelMonth: z.string().optional(),
    noOfPeople: z.union([z.string(), z.number()]).optional(),
    duration: z.string().optional(),
    vacationType: z.string().optional(),
    packageName: z.string().optional(),
    language: z.string().optional(),
    message: z.string().max(500, 'Message must be less than 500 characters').optional(),
  })
  .refine((data) => data.phone || data.whatsapp, {
    message: 'Either phone or whatsapp is required for contact',
    path: ['phone'],
  });
