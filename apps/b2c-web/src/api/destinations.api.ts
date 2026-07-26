/**
 * destinations.api.ts
 * B2C-facing public destinations read API.
 * Used by the BestDestination component on the homepage.
 */
import axiosClient from '@travelagency/api-client';

export interface PublicDestination {
  _id: string;
  name: string;
  image?: string;
  description?: string;
  orderNumber?: number;
}

export const getDestinations = async (): Promise<PublicDestination[]> => {
  const response = await axiosClient.get('/destinations');
  return response.data;
};
