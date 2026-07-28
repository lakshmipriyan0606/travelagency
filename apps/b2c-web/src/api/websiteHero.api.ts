import axiosClient from '@travelagency/api-client';
import { ENDPOINTS } from '@/lib/endpoints';

export type HeroImage = { url: string; alt?: string };

export type WebsiteHeroCard = {
  _id: string;
  title: string;
  description: string;
  backgroundImages: HeroImage[];
  isActive?: boolean;
};

export const GetActiveWebsiteHero = async () => {
  // Cache-buster to avoid stale 304 responses in some browsers/proxies
  const { data } = await axiosClient.get(`${ENDPOINTS.client.websiteHeroActive}?t=${Date.now()}`);
  return data;
};
