/**
 * Quote Request Feature — React Query hooks.
 *
 * Reuses the workspace-shared UseFetchAPIQuery and useMutationAPIQuery
 * helpers to interact with the service layer.
 */

import { UseFetchAPIQuery } from '@travelagency/hooks';
import { useMutationAPIQuery } from '@travelagency/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { quoteService } from '../services/quote.service';
import { QUOTE_QUERY_KEYS } from '../config/quote.config';
import type {
  CreateQuoteDTO,
  SaveDraftDTO,
  QuoteStatus,
  QuoteRequest,
} from '../types/quote.types';

/**
 * Hook to retrieve a list of paginated quote requests.
 */
export function useQuoteList(page = 1, pageSize = 10, status?: QuoteStatus) {
  return UseFetchAPIQuery({
    key: QUOTE_QUERY_KEYS.list({ page, pageSize, status }),
    queryFn: () => quoteService.getQuotes(page, pageSize, status),
    options: {
      staleTime: 1000 * 60, // 1 minute stale time for list view
    },
  });
}

/**
 * Hook to retrieve detail information of a single quote request by ID.
 */
export function useQuoteDetail(id: string) {
  return UseFetchAPIQuery({
    key: QUOTE_QUERY_KEYS.detail(id),
    queryFn: () => quoteService.getQuoteById(id),
    options: {
      enabled: !!id,
      staleTime: 1000 * 60 * 5, // 5 minutes stale time for detailed views
    },
  });
}

/**
 * Hook to submit a new quote request.
 * Invalidates the quote list cache on success.
 */
export function useCreateQuote() {
  const queryClient = useQueryClient();

  return useMutationAPIQuery<QuoteRequest, Error, CreateQuoteDTO>(
    (dto) => quoteService.createQuote(dto),
    {
      showToast: true,
      onSuccess: () => {
        // Invalidate list queries to trigger a fresh background fetch
        queryClient.invalidateQueries({ queryKey: QUOTE_QUERY_KEYS.all });
      },
    }
  );
}

/**
 * Hook to save a quote as draft.
 */
export function useSaveDraftQuote() {
  return useMutationAPIQuery<{ id: string; reference: string }, Error, { id: string; dto: SaveDraftDTO }>(
    ({ id, dto }) => quoteService.saveDraft(id, dto),
    {
      showToast: false,
    }
  );
}
