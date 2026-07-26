import { ReactNode } from "react";
import { toast, ToastOptions, ToastPosition } from "react-toastify";

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
