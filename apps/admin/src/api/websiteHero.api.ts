import axiosClient from '@/lib/apiClient';
import { ENDPOINTS } from "@/lib/endpoints";

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
  const { data } = await axiosClient.get(ENDPOINTS.client.websiteHero.active(Date.now()));
  return data;
};

export const GetAllWebsiteHeroes = async () => {
  const { data } = await axiosClient.get(ENDPOINTS.client.websiteHero.list);
  return data;
};

export const CreateWebsiteHero = async (payload: Partial<WebsiteHeroCard>) => {
  const { data } = await axiosClient.post(ENDPOINTS.client.websiteHero.list, payload);
  return data;
};

export const UpdateWebsiteHero = async ({
  id,
  payload,
}: {
  id: string;
  payload: Partial<WebsiteHeroCard>;
}) => {
  const { data } = await axiosClient.put(ENDPOINTS.client.websiteHero.byId(id), payload);
  return data;
};

export const DeleteWebsiteHero = async (id: string) => {
  const { data } = await axiosClient.delete(ENDPOINTS.client.websiteHero.byId(id));
  return data;
};
