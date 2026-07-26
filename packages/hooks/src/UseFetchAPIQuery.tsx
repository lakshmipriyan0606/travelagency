import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
  QueryKey,
} from "@tanstack/react-query";

export interface UseAppQueryProps<
  TQueryFnData,
  TError = unknown,
  TData = TQueryFnData
> {
  key: QueryKey;
  queryFn: () => Promise<TQueryFnData>;
  options?: Omit<
    UseQueryOptions<TQueryFnData, TError, TData>,
    "queryKey" | "queryFn"
  >;
}

export function UseFetchAPIQuery<
  TQueryFnData,
  TError = unknown,
  TData = TQueryFnData
>({
  key,
  queryFn,
  options,
}: UseAppQueryProps<TQueryFnData, TError, TData>): UseQueryResult<
  TData,
  TError
> {
  return useQuery({
    queryKey: key,
    queryFn,
    staleTime: 1000 * 60 * 2,
    retry: false,
    ...options
  });
}
