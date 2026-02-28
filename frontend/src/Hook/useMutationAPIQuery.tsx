import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
} from "@tanstack/react-query";

type UseAppMutationOptions<TData, TError, TVariables, TContext> =
  Omit<UseMutationOptions<TData, TError, TVariables, TContext>, "onSuccess" | "onError" | "onSettled"> & {
    showToast?: boolean;
    onSuccess?: (data: TData, variables: TVariables, context?: TContext) => void;
    onError?: (error: TError, variables: TVariables, context?: TContext) => void;
    onSettled?: (data: TData | undefined, error: TError | null, variables: TVariables, context?: TContext) => void;
  };

export const useMutationAPIQuery = <
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown
>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  {
    onSuccess,
    onError,
    onSettled,
    showToast = true,
    ...options
  }: UseAppMutationOptions<TData, TError, TVariables, TContext> = {}
): UseMutationResult<TData, TError, TVariables, TContext> => {
  return useMutation<TData, TError, TVariables, TContext>({
    mutationFn,
    ...options,
    onSuccess: (data, variables, context) => {
      if (showToast) {
        // dispatch(showToastAction("Success!"));
      }
      onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      if (showToast) {
        // dispatch(showToastAction("Something went wrong"));
      }
      onError?.(error, variables, context);
    },
    onSettled: (data, error, variables, context) => {
      onSettled?.(data, error, variables, context);
    },
  });
};
