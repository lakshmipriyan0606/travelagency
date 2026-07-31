"use client";

import { Search, X } from "lucide-react";
import { cn } from "@travelagency/utils";

export interface SearchInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  id?: string;
  showClear?: boolean;
}

export function SearchInput({
  value = "",
  onChange,
  onSubmit,
  onFocus,
  onBlur,
  placeholder = "Search quotes, packages, destinations...",
  className,
  id = "dashboard-search",
  showClear = true,
}: SearchInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit?.(value.trim());
    }
    if (e.key === "Escape") {
      onChange?.("");
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className={cn("relative w-full", className)}>
      <Search
        className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none"
        aria-hidden
      />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        aria-label="Search dashboard"
        autoComplete="off"
        className="h-11 w-full pl-11 pr-10 rounded-2xl border border-white/[0.08] bg-[#141416] text-sm text-white placeholder:text-zinc-500 focus:bg-[#18181A] focus:border-[#F8B400]/50 focus:ring-2 focus:ring-[#F8B400]/20 outline-none transition-all duration-200"
      />
      {showClear && value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange?.("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-6 w-6 rounded-md text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-colors"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
