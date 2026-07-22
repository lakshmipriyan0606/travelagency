import axiosClient from "../axiosClient";

export type WebsiteHeroConfig = {
  title: string;
  description: string;
  backgroundImages: { url: string; alt?: string }[];
};

export const GetWebsiteHeroConfig = async () => {
  const { data } = await axiosClient.get("ui/website-hero");
  return data;
};

export const UpdateWebsiteHeroConfig = async (payload: Partial<WebsiteHeroConfig>) => {
  const { data } = await axiosClient.put("admin/ui/website-hero", payload);
  return data;
};

