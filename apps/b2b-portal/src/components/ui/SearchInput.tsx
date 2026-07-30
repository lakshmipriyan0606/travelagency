"use client";

import { Search } from "lucide-react";
import { cn } from "@travelagency/utils";

export interface SearchInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

export function SearchInput({
  value = "",
  onChange,
  placeholder = "Search quotes, packages, destinations...",
  className,
  id = "dashboard-search",
}: SearchInputProps) {
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
        placeholder={placeholder}
        aria-label="Search dashboard"
        className="h-11 w-full pl-11 pr-4 rounded-2xl border border-white/[0.08] bg-[#141416] text-sm text-white placeholder:text-zinc-500 focus:bg-[#18181A] focus:border-[#F8B400]/50 focus:ring-2 focus:ring-[#F8B400]/20 outline-none transition-all duration-200"
      />
    </div>
  );
}
