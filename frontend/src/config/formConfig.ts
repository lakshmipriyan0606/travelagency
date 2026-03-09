/**
 * formConfig.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Central config that drives BOTH the Hero enquiry mini-form and the
 * full ReachUs booking form.
 *
 * To add / remove a field in future, edit ONLY this file.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import * as z from 'zod';

// ─── Option helpers ───────────────────────────────────────────────────────────

export interface SelectOption {
  value: string;
  label: string;
}

export const destinationOptions: SelectOption[] = [
  { value: 'singapore', label: 'Singapore' },
  { value: 'bali', label: 'Bali' },
  { value: 'maldives', label: 'Maldives' },
  { value: 'dubai', label: 'Dubai' },
  { value: 'switzerland', label: 'Switzerland' },
  { value: 'thailand', label: 'Thailand' },
  { value: 'malaysia', label: 'Malaysia' },
  { value: 'europe', label: 'Europe' },
];

export const travelMonthOptions: SelectOption[] = [
  { value: 'january', label: 'January' },
  { value: 'february', label: 'February' },
  { value: 'march', label: 'March' },
  { value: 'april', label: 'April' },
  { value: 'may', label: 'May' },
  { value: 'june', label: 'June' },
  { value: 'july', label: 'July' },
  { value: 'august', label: 'August' },
  { value: 'september', label: 'September' },
  { value: 'october', label: 'October' },
  { value: 'november', label: 'November' },
  { value: 'december', label: 'December' },
];

export const personsOptions: SelectOption[] = Array.from({ length: 20 }, (_, i) => ({
  value: String(i + 1),
  label: `${i + 1} ${i === 0 ? 'Person' : 'Persons'}`,
}));

export const durationOptions: SelectOption[] = [
  { value: '1N2D', label: '1 Night / 2 Days' },
  { value: '2N3D', label: '2 Nights / 3 Days' },
  { value: '3N4D', label: '3 Nights / 4 Days' },
  { value: '4N5D', label: '4 Nights / 5 Days' },
  { value: '5N6D', label: '5 Nights / 6 Days' },
  { value: '6N7D', label: '6 Nights / 7 Days' },
  { value: '7N8D', label: '7 Nights / 8 Days' },
  { value: '8N9D', label: '8 Nights / 9 Days' },
  { value: '9N10D', label: '9 Nights / 10 Days' },
  { value: '10N11D', label: '10 Nights / 11 Days' },
];

export const vacationTypeOptions: SelectOption[] = [
  { value: 'family', label: 'Family Vacation' },
  { value: 'honeymoon', label: 'Honeymoon' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'business', label: 'Business' },
  { value: 'pilgrimage', label: 'Pilgrimage' },
];

export const languageOptions: SelectOption[] = [
  { value: 'english', label: 'English' },
  { value: 'tamil', label: 'Tamil' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'telugu', label: 'Telugu' },
  { value: 'kannada', label: 'Kannada' },
  { value: 'malayalam', label: 'Malayalam' },
];

// ─── Field type ───────────────────────────────────────────────────────────────

export type FormFieldType = 'select' | 'text' | 'email' | 'phone' | 'date';

export interface FormFieldConfig {
  name: string;
  label: string;
  placeholder: string;
  type: FormFieldType;
  options?: SelectOption[];        // only for 'select'
  required: boolean;
  /** Lucide icon name shown in the icon-row style card */
  icon: 'MapPin' | 'Calendar' | 'Users' | 'Clock' | 'User' | 'Mail' | 'Phone' | 'Globe';
}

// ─── Hero form — 4-field mini enquiry (Step 1) ────────────────────────────────

export const heroFormFields: FormFieldConfig[] = [
  {
    name: 'destination',
    label: 'Destination',
    placeholder: 'Select Destination',
    type: 'select',
    options: destinationOptions,
    required: true,
    icon: 'MapPin',
  },
  {
    name: 'travelMonth',
    label: 'Travel Month',
    placeholder: 'Select Month',
    type: 'select',
    options: travelMonthOptions,
    required: true,
    icon: 'Calendar',
  },
  {
    name: 'noOfPeople',
    label: 'Number of Persons',
    placeholder: 'Select Persons',
    type: 'select',
    options: personsOptions,
    required: true,
    icon: 'Users',
  },
  {
    name: 'duration',
    label: 'Duration',
    placeholder: 'Select Duration',
    type: 'select',
    options: durationOptions,
    required: true,
    icon: 'Clock',
  },
];

export const heroFormSchema = z.object({
  destination: z.string().min(1, 'Please select destination'),
  travelMonth: z.string().min(1, 'Please select travel month'),
  noOfPeople: z.string().min(1, 'Please select no. of persons'),
  duration: z.string().min(1, 'Please select duration'),
});

export type HeroFormData = z.infer<typeof heroFormSchema>;

// ─── ReachUs form — full booking form (Step 1 + 2 combined) ──────────────────

export const reachUsFormFields: FormFieldConfig[] = [
  {
    name: 'destination',
    label: 'Destination',
    placeholder: 'Select Destination',
    type: 'select',
    options: destinationOptions,
    required: true,
    icon: 'MapPin',
  },
  {
    name: 'travelMonth',
    label: 'Travel Month',
    placeholder: 'Select Month',
    type: 'select',
    options: travelMonthOptions,
    required: true,
    icon: 'Calendar',
  },
  {
    name: 'noOfPeople',
    label: 'Number of Persons',
    placeholder: 'Select Persons',
    type: 'select',
    options: personsOptions,
    required: true,
    icon: 'Users',
  },
  {
    name: 'duration',
    label: 'Duration',
    placeholder: 'Select Duration',
    type: 'select',
    options: durationOptions,
    required: true,
    icon: 'Clock',
  },
  {
    name: 'name',
    label: 'Name',
    placeholder: 'Your Name',
    type: 'text',
    required: true,
    icon: 'User',
  },
  {
    name: 'email',
    label: 'Email',
    placeholder: 'youremail@gmail.com',
    type: 'email',
    required: true,
    icon: 'Mail',
  },
  {
    name: 'whatsapp',
    label: 'WhatsApp',
    placeholder: '+91',
    type: 'phone',
    required: true,
    icon: 'Phone',
  },
  {
    name: 'language',
    label: 'Preferred Language',
    placeholder: 'Select Language',
    type: 'select',
    options: languageOptions,
    required: false,
    icon: 'Globe',
  },
];

export const reachUsFormSchema = z.object({
  destination: z.string().min(1, 'Please select destination'),
  travelMonth: z.string().min(1, 'Please select travel month'),
  noOfPeople: z.string().min(1, 'Please select no. of persons'),
  duration: z.string().min(1, 'Please select duration'),
  name: z.string()
    .min(1, 'Name is required')
    .regex(/^[a-zA-Z\s\.]+$/, 'Name can only contain alphabets, spaces, and dots'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email')
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid email format'),
  whatsapp: z.string()
    .min(1, 'WhatsApp number is required')
    .regex(/^\+?[0-9]{10,15}$/, 'Invalid WhatsApp number'),
  language: z.string().min(1, 'Please select language'),
});

export type ReachUsFormData = z.infer<typeof reachUsFormSchema>;
