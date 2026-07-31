"use client";

import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@travelagency/ui";
import { ROUTES } from "@/lib/routes";

export interface UserMenuProps {
  agencyName: string;
  onLogout?: () => void;
}

export function UserMenu({ agencyName, onLogout }: UserMenuProps) {
  const router = useRouter();
  const initial = agencyName.charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 h-10 pl-1 pr-2 rounded-xl border border-white/[0.08] bg-[#141416] hover:bg-white/[0.04] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#F8B400]/50"
          aria-label="Open account menu"
        >
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-[#F8B400] to-[#E8A800] text-black font-extrabold text-sm">
            {initial}
          </div>
          <span className="hidden md:block text-sm font-semibold text-white max-w-[120px] truncate">
            {agencyName}
          </span>
          <ChevronDown className="hidden md:block h-4 w-4 text-zinc-500" aria-hidden />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="min-w-[200px] border-white/[0.08] bg-[#141416] text-zinc-200 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
      >
        <DropdownMenuLabel className="text-xs font-semibold text-zinc-400">
          {agencyName}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/[0.08]" />

        <DropdownMenuItem
          className="cursor-pointer gap-2 text-sm focus:bg-white/[0.06] focus:text-white"
          onSelect={() => router.push(ROUTES.profile)}
        >
          <User className="h-4 w-4 text-zinc-400" />
          Agency Profile
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-white/[0.08]" />

        <DropdownMenuItem
          className="cursor-pointer gap-2 text-sm text-red-400 focus:bg-red-500/10 focus:text-red-300"
          onSelect={() => onLogout?.()}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
