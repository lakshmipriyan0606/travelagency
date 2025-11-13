import { useDispatch } from "react-redux";
import {
  useQuery,
  useQueryClient,
  UseQueryOptions,
  UseQueryResult,
  QueryKey,
} from "@tanstack/react-query";

type ExtraContext = {
  queryClient: ReturnType<typeof useQueryClient>;
  dispatch: ReturnType<typeof useDispatch>;
};

type UseAppQueryOptions<
  TQueryFnData,
  TError,
  TData,
  TQueryKey extends QueryKey
> = Omit<
  UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  "queryKey" | "queryFn" | "onSuccess" | "onError"
> & {
  onSuccess?: (data: TData, ctx: ExtraContext) => void;
  onError?: (error: TError, ctx: ExtraContext) => void;
};

export function UseFetchAPIQuery<
  TData = unknown,
  TError = unknown,
  TQueryFnData = TData,
  TQueryKey extends QueryKey = QueryKey
>(
  key: TQueryKey,
  queryFn: () => Promise<TQueryFnData>,
  options?: UseAppQueryOptions<TQueryFnData, TError, TData, TQueryKey>
): UseQueryResult<TData, TError> {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const ctx: ExtraContext = { queryClient, dispatch };

  const { onSuccess, onError, ...rest } = options ?? {};

  const finalOptions = {
    queryKey: key,
    queryFn,
    ...rest,
    onSuccess: (data: TQueryFnData) => {
      onSuccess?.(data as unknown as TData, ctx);
    },
    onError: (error: TError) => {
      onError?.(error, ctx);
    },
  } as UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>;

  return useQuery(finalOptions);
}