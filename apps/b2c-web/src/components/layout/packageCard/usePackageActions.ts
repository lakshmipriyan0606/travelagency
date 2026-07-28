import { useMutationAPIQuery } from "@travelagency/hooks";
import { UpdateLikePackage } from "@/api/user/api";
import { useQueryClient } from "@tanstack/react-query";
import { LikePayload } from "./types";

export function usePackageActions(refetch?: () => void) {
    const queryClient = useQueryClient();

    const updateLike = useMutationAPIQuery<unknown, any, LikePayload>(
        UpdateLikePackage,
        {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["likePackage"] });
                queryClient.invalidateQueries({ queryKey: ["bestPackage"] });
            },
        }
    );

    return {
        updateLike: updateLike.mutate,
    };
}
