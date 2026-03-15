import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast, ToastOptions, ToastPosition } from "react-toastify";
import { ReactNode } from "react";

import { GLOBAL_CONFIG } from "@/config/globalConfig";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const WANumber = GLOBAL_CONFIG.contact.whatsappNumber;
export const WADisplayNumber = GLOBAL_CONFIG.contact.whatsappDisplay;
export const CurrencySymbol = GLOBAL_CONFIG.currency.symbol;


type ToastType = "success" | "error" | "info" | "warning";

interface ShowToastParams {
  type?: ToastType;
  content: ReactNode;
  position?: ToastPosition;
  options?: ToastOptions;
}

const defaultOptions: ToastOptions = {
  autoClose: 3000,
};

export const showToast = ({
  type = "success",
  content,
  position = "top-right",
  options = {},
}: ShowToastParams): void => {
  toast[type](content, {
    position,
    ...defaultOptions,
    ...options,
  });
};

