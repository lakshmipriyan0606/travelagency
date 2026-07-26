import axiosClient from '@travelagency/api-client';

export type WebsiteHeroConfig = {
  title: string;
  description: string;
  backgroundImages: { url: string; alt?: string }[];
};

export const GetWebsiteHeroConfig = async () => {
  const { data } = await axiosClient.get("ui-config/website-hero");
  return data;
};

export const UpdateWebsiteHeroConfig = async (payload: Partial<WebsiteHeroConfig>) => {
  const { data } = await axiosClient.put("admin/ui-config/website-hero", payload);
  return data;
};

