import axiosClient from '@/lib/apiClient';
import { ENDPOINTS } from "@/lib/endpoints";

export interface MediaAsset {
  publicId: string;
  url: string;
}

export const getMediaAssets = async (folder?: string): Promise<MediaAsset[]> => {
  const { data } = await axiosClient.get(ENDPOINTS.client.upload.all({ folder: folder || "" }));
  return data?.images || [];
};

export const uploadMediaAsset = async (file: File, folder: string): Promise<{ url: string }> => {
  const form = new FormData();
  form.append("image", file);
  form.append("folder", folder);
  const { data } = await axiosClient.post(ENDPOINTS.client.upload.image, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};
