"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog";
import { cn } from "@travelagency/utils";

export interface SignOutConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Disable buttons while logout is in flight */
  confirming?: boolean;
}

/**
 * Gold-dark themed “Sign out?” confirmation used by admin + B2B portal shells.
 */
export function SignOutConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Sign out?",
  description = "You will need to sign in again to access your dashboard.",
  confirmLabel = "Sign out",
  cancelLabel = "Cancel",
  confirming = false,
}: SignOutConfirmDialogProps) {
  const [busy, setBusy] = React.useState(false);
  const isBusy = confirming || busy;

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isBusy) return;
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className={cn(
          "bg-[#121216] border border-white/[0.10] text-white shadow-[0_24px_80px_rgba(0,0,0,0.75)]",
          "rounded-2xl p-6 sm:max-w-md gap-5"
        )}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold text-white tracking-tight">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-zinc-400 text-sm leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-2 sm:gap-3">
          <AlertDialogCancel
            disabled={isBusy}
            className={cn(
              "rounded-xl border border-white/[0.10] bg-transparent text-zinc-300",
              "hover:bg-white/[0.06] hover:text-white"
            )}
          >
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isBusy}
            onClick={handleConfirm}
            className={cn(
              "rounded-xl bg-[#F8B400] text-black font-bold",
              "hover:bg-[#E8A800] focus-visible:ring-[#F8B400]/40",
              "disabled:opacity-60"
            )}
          >
            {isBusy ? "Signing out…" : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
