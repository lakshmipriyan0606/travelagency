import axiosClient from '@/lib/apiClient';
import { ENDPOINTS } from '@/lib/endpoints';

export type HeroImage = { url: string; alt?: string };

export type WebsiteHeroCard = {
  _id: string;
  title: string;
  description: string;
  backgroundImages: HeroImage[];
  isActive?: boolean;
};

export const getActiveWebsiteHero = async (): Promise<WebsiteHeroCard> => {
  const { data } = await axiosClient.get(ENDPOINTS.client.websiteHero.active(Date.now()));
  return data?.data || data;
};

export const getAllWebsiteHeroes = async (): Promise<WebsiteHeroCard[]> => {
  const { data } = await axiosClient.get(ENDPOINTS.client.websiteHero.list);
  return data?.data || data || [];
};

export const createWebsiteHero = async (payload: Partial<WebsiteHeroCard>): Promise<WebsiteHeroCard> => {
  const { data } = await axiosClient.post(ENDPOINTS.client.websiteHero.list, payload);
  return data?.data || data;
};

export const updateWebsiteHero = async ({ id, payload }: { id: string; payload: Partial<WebsiteHeroCard> }): Promise<WebsiteHeroCard> => {
  const { data } = await axiosClient.put(ENDPOINTS.client.websiteHero.byId(id), payload);
  return data?.data || data;
};

export const deleteWebsiteHero = async (id: string): Promise<void> => {
  await axiosClient.delete(ENDPOINTS.client.websiteHero.byId(id));
};
