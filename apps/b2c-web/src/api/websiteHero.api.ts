import axiosClient from '@travelagency/api-client';

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
  const { data } = await axiosClient.get(`website-hero/active?t=${Date.now()}`);
  return data;
};

export const GetAllWebsiteHeroes = async () => {
  const { data } = await axiosClient.get("admin/website-hero");
  return data;
};

export const CreateWebsiteHero = async (payload: Partial<WebsiteHeroCard>) => {
  const { data } = await axiosClient.post("admin/website-hero", payload);
  return data;
};

export const UpdateWebsiteHero = async ({
  id,
  payload,
}: {
  id: string;
  payload: Partial<WebsiteHeroCard>;
}) => {
  const { data } = await axiosClient.put(`admin/website-hero/${id}`, payload);
  return data;
};

export const DeleteWebsiteHero = async (id: string) => {
  const { data } = await axiosClient.delete(`admin/website-hero/${id}`);
  return data;
};
