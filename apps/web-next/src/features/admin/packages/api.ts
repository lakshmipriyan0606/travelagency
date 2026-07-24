"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { 
  DeleteCurrentPackage, 
  TogglePackageStatus, 
  UpdatePackageRank 
} from "@/api/admin/auth.api";

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
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete package");
    },
  });
}

export function useTogglePackageStatus() {
  return useMutation({
    mutationFn: (id: string) => TogglePackageStatus(id),
    onSuccess: () => {
      toast.success("Package status updated");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update status");
    },
  });
}

export function useUpdatePackageRank() {
  return useMutation({
    mutationFn: ({ id, bestRank }: { id: string; bestRank: string | null }) => UpdatePackageRank({ id, bestRank }),
    onSuccess: () => {
      toast.success("Package rank updated");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update rank");
    },
  });
}
