import axiosClient from '@travelagency/api-client';

export type HeroImage = { url: string; alt?: string };

export type WebsiteHeroCard = {
  _id: string;
  title: string;
  description: string;
  backgroundImages: HeroImage[];
  isActive?: boolean;
};

export const getActiveWebsiteHero = async (): Promise<WebsiteHeroCard> => {
  const { data } = await axiosClient.get(`/website-hero/active?t=${Date.now()}`);
  return data?.data || data;
};

export const getAllWebsiteHeroes = async (): Promise<WebsiteHeroCard[]> => {
  const { data } = await axiosClient.get("/admin/website-hero");
  return data?.data || data || [];
};

export const createWebsiteHero = async (payload: Partial<WebsiteHeroCard>): Promise<WebsiteHeroCard> => {
  const { data } = await axiosClient.post("/admin/website-hero", payload);
  return data?.data || data;
};

export const updateWebsiteHero = async ({ id, payload }: { id: string; payload: Partial<WebsiteHeroCard> }): Promise<WebsiteHeroCard> => {
  const { data } = await axiosClient.put(`/admin/website-hero/${id}`, payload);
  return data?.data || data;
};

export const deleteWebsiteHero = async (id: string): Promise<void> => {
  await axiosClient.delete(`/admin/website-hero/${id}`);
};
