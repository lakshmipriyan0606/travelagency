import { z } from 'zod';

export const registerSchema = z
  .object({
    companyName: z.string().min(1, 'Company name is required'),
    tradeName: z.string().optional(),
    businessType: z.enum(['travel_agency', 'tour_operator', 'dmc', 'freelance_agent']),
    registrationNumber: z.string().min(1, 'Registration number is required'),
    country: z.string().min(1, 'Country is required'),
    gstNumber: z.string().optional(),
    officeAddress: z.object({
      line1: z.string().min(1, 'Address line 1 is required'),
      line2: z.string().optional(),
      city: z.string().min(1, 'City is required'),
      state: z.string().min(1, 'State is required'),
      postalCode: z.string().min(1, 'Postal code is required'),
      country: z.string().min(1, 'Country is required'),
    }),
    websiteUrl: z.string().url().optional().or(z.literal('')),
    yearsInBusiness: z.number().int().nonnegative().optional(),
    iataNumber: z.string().optional(),
    name: z.string().min(1, 'User name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(1, 'Phone number is required'),
    designation: z.string().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  })
  .refine(
    (data) => {
      if (data.country === 'India' && (!data.gstNumber || data.gstNumber.trim() === '')) {
        return false;
      }
      return true;
    },
    {
      message: 'GST number is required for agencies based in India',
      path: ['gstNumber'],
    }
  );
