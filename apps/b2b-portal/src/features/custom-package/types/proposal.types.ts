/**
 * Create Custom Package — types aligned with agency proposal + master APIs.
 */

export type ProposalStatus =
  | "draft"
  | "priced"
  | "saved"
  | "submitted"
  | "under_review"
  | "revision_requested";


export interface MasterCity {
  _id: string;
  name: string;
  countryCode: string;
  region?: string;
  isActive: boolean;
}

export interface MasterHotel {
  _id: string;
  name: string;
  cityId: string | { _id: string; name: string };
  starRating: 3 | 4 | 5;
  baseNightlyRate: number;
  currency: string;
  notes?: string;
  isActive: boolean;
}

export interface MasterPackage {
  _id: string;
  name: string;
  cityId: string | { _id: string; name: string };
  hotelId?: string | { _id: string; name: string } | null;
  nights: number;
  description?: string;
  amounts: {
    basePrice: number;
    perNight: number;
    transferAddon: number;
    activityAddon: number;
  };
  currency: string;
  isActive: boolean;
}

export interface DestinationStop {
  cityId: string;
  nights: number;
  hotelId?: string | null;
  packageId?: string | null;
}

export interface TripDetailsInput {
  leavingFromCityId?: string;
  nationalityCode?: string;
  leavingOn?: string;
  rooms?: number;
  adults?: number;
  children?: number;
  starRating?: 0 | 3 | 4 | 5;
  includeTransfers?: boolean;
}

export interface PricingBreakdownLine {
  label: string;
  amount: number;
}

export interface ProposalPricing {
  currency: string;
  subtotal: number;
  transferTotal: number;
  total: number;
  breakdown: PricingBreakdownLine[];
}

export interface ProposalDestination {
  cityId: string;
  cityName: string;
  nights: number;
  hotelId?: string | null;
  hotelName?: string;
  packageId?: string | null;
}

export interface ProposalTripDetails {
  leavingFromCityId?: string | null;
  leavingFromName?: string;
  nationalityCode?: string;
  leavingOn?: string | null;
  rooms: number;
  adults: number;
  children: number;
  starRating: number;
  includeTransfers: boolean;
}

export interface CustomProposal {
  id: string;
  _id?: string;
  reference: string;
  status: ProposalStatus;
  adminFeedback?: string;
  destinations: ProposalDestination[];
  tripDetails: ProposalTripDetails;
  pricing: ProposalPricing;
  createdAt: string;
  updatedAt: string;
}

export interface PriceProposalDTO {
  destinations: DestinationStop[];
  tripDetails: TripDetailsInput;
  save?: boolean;
}
