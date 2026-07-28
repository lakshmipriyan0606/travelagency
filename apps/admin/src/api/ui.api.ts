import axiosClient from '@/lib/apiClient';
import { ENDPOINTS } from "@/lib/endpoints";

export type WebsiteHeroConfig = {
  title: string;
  description: string;
  backgroundImages: { url: string; alt?: string }[];
};

export const GetWebsiteHeroConfig = async () => {
  const { data } = await axiosClient.get(ENDPOINTS.client.uiConfig.hero);
  return data;
};

export const UpdateWebsiteHeroConfig = async (payload: Partial<WebsiteHeroConfig>) => {
  const { data } = await axiosClient.put(ENDPOINTS.client.uiConfig.adminHero, payload);
  return data;
};

