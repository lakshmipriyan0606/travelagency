import axiosClient from '@travelagency/api-client';
import { ENDPOINTS } from '@/lib/endpoints';

export const getStories = async () => {
    const { data } = await axiosClient.get(ENDPOINTS.client.stories);
    return data;
};
