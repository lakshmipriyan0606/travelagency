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

import { destinationOptions } from './destinations';
import { GLOBAL_CONFIG } from './globalConfig';
export { destinationOptions };

export const travelMonthOptions: SelectOption[] = GLOBAL_CONFIG.months;

export const personsOptions: SelectOption[] = GLOBAL_CONFIG.personCounts;

export const durationOptions: SelectOption[] = GLOBAL_CONFIG.durations;

export const vacationTypeOptions: SelectOption[] = GLOBAL_CONFIG.vacationTypes;

export const languageOptions: SelectOption[] = GLOBAL_CONFIG.languages;

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
    placeholder: 'e.g., 3 Days, 2 Nights',
    type: 'text',
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
    placeholder: 'e.g., 3 Days, 2 Nights',
    type: 'text',
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
