import { useMutationAPIQuery } from "@/Hook/useMutationAPIQuery";
import { DeleteCurrentPackage, UpdatePackageRank, TogglePackageStatus } from "@/api/admin/auth.api";
import { UpdateLikePackage } from "@/api/user/api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { LikePayload } from "./types";

export function usePackageActions(refetch?: () => void) {
    const queryClient = useQueryClient();

    const deletePackage = useMutationAPIQuery(DeleteCurrentPackage, {
        onSuccess: () => {
            toast.success("Package deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["allPackage"] });
            refetch?.();
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to delete package");
        }
    });

    const updateLike = useMutationAPIQuery<unknown, any, LikePayload>(
        UpdateLikePackage,
        {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["likePackage"] });
                queryClient.invalidateQueries({ queryKey: ["bestPackage"] });
            },
        }
    );

    const updateRank = useMutationAPIQuery(UpdatePackageRank, {
        onSuccess: () => {
            toast.success("Rank updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["allPackage"] });
            queryClient.invalidateQueries({ queryKey: ["bestPackage"] });
            queryClient.invalidateQueries({ queryKey: ["takenRanks"] });
            refetch?.();
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to update rank");
        },
    });

    const toggleStatus = useMutationAPIQuery(TogglePackageStatus, {
        onSuccess: (data: any) => {
            toast.success(data?.message || "Status updated!");
            queryClient.invalidateQueries({ queryKey: ["allPackage"] });
            refetch?.();
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to toggle status");
        },
    });

    return {
        deletePackage: deletePackage.mutate,
        updateLike: updateLike.mutate,
        updateRank: updateRank.mutate,
        toggleStatus: toggleStatus.mutate,
    };
}
