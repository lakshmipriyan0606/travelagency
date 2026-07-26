import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS class names with conflict resolution.
 *
 * Combines `clsx` (conditional class joining) with `tailwind-merge`
 * (intelligent Tailwind class deduplication).
 *
 * Used by every UI component in the design system.
 *
 * @example
 * cn("px-4 py-2", isActive && "bg-blue-500", className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
