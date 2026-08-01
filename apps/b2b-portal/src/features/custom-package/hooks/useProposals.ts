/**
 * Create Custom Package — React Query hooks.
 */

import { UseFetchAPIQuery, useMutationAPIQuery } from "@travelagency/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { proposalService } from "../services/proposal.service";
import { PROPOSAL_QUERY_KEYS } from "../config/proposal.config";
import type {
  CustomProposal,
  MasterCity,
  MasterHotel,
  MasterPackage,
  PriceProposalDTO,
} from "../types/proposal.types";

export function useMasterCities() {
  return UseFetchAPIQuery<MasterCity[]>({
    key: PROPOSAL_QUERY_KEYS.cities(),
    queryFn: () => proposalService.getCities(),
    options: { staleTime: 1000 * 60 * 5 },
  });
}

export function useMasterHotels(cityId: string) {
  return UseFetchAPIQuery<MasterHotel[]>({
    key: PROPOSAL_QUERY_KEYS.hotels(cityId),
    queryFn: () => proposalService.getHotels(cityId),
    options: {
      enabled: Boolean(cityId),
      staleTime: 1000 * 60 * 2,
    },
  });
}

export function useMasterPackages(cityId: string) {
  return UseFetchAPIQuery<MasterPackage[]>({
    key: PROPOSAL_QUERY_KEYS.packages(cityId),
    queryFn: () => proposalService.getPackages(cityId),
    options: {
      enabled: Boolean(cityId),
      staleTime: 1000 * 60 * 2,
    },
  });
}

export function useProposalDetail(id: string) {
  return UseFetchAPIQuery<CustomProposal>({
    key: PROPOSAL_QUERY_KEYS.detail(id),
    queryFn: () => proposalService.getProposal(id),
    options: {
      enabled: Boolean(id),
      staleTime: 1000 * 30,
    },
  });
}

export function useProposalList() {
  return UseFetchAPIQuery<CustomProposal[]>({
    key: PROPOSAL_QUERY_KEYS.list(),
    queryFn: () => proposalService.listProposals(),
    options: { staleTime: 1000 * 30 },
  });
}

export function usePriceProposal() {
  const queryClient = useQueryClient();

  return useMutationAPIQuery<
    CustomProposal,
    Error,
    { dto: PriceProposalDTO; existingId?: string }
  >(({ dto, existingId }) => proposalService.priceProposal(dto, existingId), {
    showToast: true,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPOSAL_QUERY_KEYS.all });
    },
  });
}

/** Silent draft auto-save (same proposal id) — no toast spam. */
export function useAutoSaveDraft() {
  const queryClient = useQueryClient();

  return useMutationAPIQuery<
    CustomProposal,
    Error,
    { dto: PriceProposalDTO; existingId?: string }
  >(
    ({ dto, existingId }) =>
      proposalService.priceProposal({ ...dto, save: false }, existingId),
    {
      showToast: false,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: PROPOSAL_QUERY_KEYS.list() });
      },
    }
  );
}

export function useSaveProposal() {
  const queryClient = useQueryClient();

  return useMutationAPIQuery<
    CustomProposal,
    Error,
    { dto: PriceProposalDTO; existingId: string }
  >(
    ({ dto, existingId }) =>
      proposalService.priceProposal({ ...dto, save: true }, existingId),
    {
      showToast: true,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: PROPOSAL_QUERY_KEYS.all });
      },
    }
  );
}

export function useResubmitProposal() {
  const queryClient = useQueryClient();

  return useMutationAPIQuery<CustomProposal, Error, string>(
    (id) => proposalService.resubmitProposal(id),
    {
      showToast: true,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: PROPOSAL_QUERY_KEYS.all });
      },
    }
  );
}
