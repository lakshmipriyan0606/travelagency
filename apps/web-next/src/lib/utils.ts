import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ReactNode } from "react";

import { GLOBAL_CONFIG } from "@/config/globalConfig";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const WANumber = GLOBAL_CONFIG.contact.whatsappNumber;
export const WADisplayNumber = GLOBAL_CONFIG.contact.whatsappDisplay;
export const IndiaWANumber = GLOBAL_CONFIG.contact.indiaWhatsappNumber;
export const IndiaWADisplayNumber = GLOBAL_CONFIG.contact.indiaWhatsappDisplay;
export const ContactEmail = GLOBAL_CONFIG.contact.email;
export const CurrencySymbol = GLOBAL_CONFIG.currency.symbol;




