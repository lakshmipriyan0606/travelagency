import { z } from 'zod';

export const registerSchema = z
  .object({
    companyName: z.string().trim().min(1, 'Company name is required'),
    tradeName: z.string().trim().optional(),
    businessType: z.enum(['travel_agency', 'tour_operator', 'dmc', 'freelance_agent']),
    registrationNumber: z.string().trim().min(1, 'Registration number is required'),
    country: z.string().trim().min(1, 'Country is required'),
    gstNumber: z.string().trim().optional(),
    officeAddress: z.object({
      line1: z.string().trim().min(1, 'Address line 1 is required'),
      line2: z.string().trim().optional(),
      city: z.string().trim().min(1, 'City is required'),
      state: z.string().trim().min(1, 'State is required'),
      postalCode: z.string().trim().min(1, 'Postal code is required'),
      country: z.string().trim().min(1, 'Country is required'),
    }),
    websiteUrl: z.string().trim().url().optional().or(z.literal('')),
    yearsInBusiness: z.number().int().nonnegative().optional(),
    iataNumber: z.string().trim().optional(),
    name: z.string().trim().min(1, 'User name is required'),
    email: z.string().trim().email('Invalid email address'),
    phone: z.string().trim().min(1, 'Phone number is required'),
    designation: z.string().trim().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  })
  .strict()
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

export const createQuoteSchema = z
  .object({
    destination: z.string().trim().min(2, 'Destination must be at least 2 characters').max(100),
    travelStart: z.string().trim().transform((val) => {
      const d = new Date(val);
      if (isNaN(d.getTime())) {
        throw new Error('Invalid travel start date');
      }
      return d;
    }).refine((date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    }, { message: 'Travel start date cannot be in the past' }),
    travelEnd: z.string().trim().transform((val) => {
      const d = new Date(val);
      if (isNaN(d.getTime())) {
        throw new Error('Invalid travel end date');
      }
      return d;
    }),
    adults: z.number().int().min(1, 'At least 1 adult is required'),
    children: z.number().int().min(0, 'Children count cannot be negative').default(0),
    rooms: z.number().int().min(1, 'At least 1 room is required'),
    budgetCategory: z.enum(['economy', 'standard', 'premium', 'luxury']),
    preferredHotels: z.string().trim().max(500).optional(),
    transfers: z.enum(['none', 'shared', 'private', 'luxury']).default('none'),
    meals: z.enum(['none', 'breakfast', 'half_board', 'full_board', 'all_inclusive']).default('none'),
    guideRequired: z.boolean().default(false),
    specialRequirements: z.string().trim().max(1000).optional(),
    contactPerson: z.object({
      name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
      email: z.string().trim().email('Invalid email address'),
      phone: z.string().trim().min(7, 'Phone number must be at least 7 digits').max(20),
      designation: z.string().trim().max(80).optional(),
    }).strict(),
  })
  .strict()
  .refine(
    (data) => data.travelEnd >= data.travelStart,
    {
      message: 'Travel end date must be on or after travel start date',
      path: ['travelEnd'],
    }
  );

export const saveDraftSchema = z.object({
  destination: z.string().trim().min(2).max(100).optional(),
  travelStart: z.string().trim().optional().transform((val) => val ? new Date(val) : undefined),
  travelEnd: z.string().trim().optional().transform((val) => val ? new Date(val) : undefined),
  adults: z.number().int().min(1).optional(),
  children: z.number().int().min(0).optional(),
  rooms: z.number().int().min(1).optional(),
  budgetCategory: z.enum(['economy', 'standard', 'premium', 'luxury']).optional(),
  preferredHotels: z.string().trim().max(500).optional(),
  transfers: z.enum(['none', 'shared', 'private', 'luxury']).optional(),
  meals: z.enum(['none', 'breakfast', 'half_board', 'full_board', 'all_inclusive']).optional(),
  guideRequired: z.boolean().optional(),
  specialRequirements: z.string().trim().max(1000).optional(),
  contactPerson: z.object({
    name: z.string().trim().min(2).max(80).optional(),
    email: z.string().trim().email().optional(),
    phone: z.string().trim().min(7).max(20).optional(),
    designation: z.string().trim().max(80).optional(),
  }).strict().optional(),
}).strict();
