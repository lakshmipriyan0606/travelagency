"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  DeleteCurrentPackage,
  GetTakenRanks,
  TogglePackageStatus,
  UpdatePackageRank,
} from "@/api/auth.api";
import type { TakenRank } from "@/features/catalog-list/types";

/** Prefer API error envelope `{ error: { message } }`, then top-level `message`. */
function getApiErrorMessage(error: unknown, fallback: string): string {
  const data = (error as { response?: { data?: Record<string, unknown> } })?.response?.data;
  if (!data || typeof data !== "object") return fallback;
  const nested = data.error;
  if (nested && typeof nested === "object" && typeof (nested as { message?: unknown }).message === "string") {
    return (nested as { message: string }).message;
  }
  if (typeof data.message === "string" && data.message) return data.message;
  return fallback;
}

export function useDeletePackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => DeleteCurrentPackage(id),
    onMutate: () => {
      toast.info("Deleting package...");
    },
    onSuccess: () => {
      toast.success("Package deleted successfully");
      // The server component will be refreshed via router.refresh() 
      // by the calling component, or we can invalidate specific queries if using hybrid approach.
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to delete package"));
    },
  });
}

export function useTogglePackageStatus() {
  return useMutation({
    mutationFn: (id: string) => TogglePackageStatus(id),
    onSuccess: () => {
      toast.success("Package status updated");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to update status"));
    },
  });
}

function parseTakenRanks(payload: unknown): TakenRank[] {
  if (!payload || typeof payload !== "object") return [];
  const body = payload as Record<string, unknown>;
  const candidates = [body.takenRanks, body.data];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate as TakenRank[];
    if (candidate && typeof candidate === "object") {
      const nested = (candidate as Record<string, unknown>).takenRanks;
      if (Array.isArray(nested)) return nested as TakenRank[];
    }
  }
  return [];
}

export function useTakenRanks(enabled = true) {
  return useQuery({
    queryKey: ["takenRanks"],
    queryFn: async () => parseTakenRanks(await GetTakenRanks()),
    enabled,
    staleTime: 30_000,
  });
}

export function useUpdatePackageRank() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, bestRank }: { id: string; bestRank: string | null }) =>
      UpdatePackageRank({ id, bestRank }),
    onSuccess: () => {
      toast.success("Best package rank updated");
      queryClient.invalidateQueries({ queryKey: ["takenRanks"] });
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to update rank"));
    },
  });
}
