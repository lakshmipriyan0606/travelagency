import axiosClient from '@/lib/apiClient';
import { Destination, DestinationFormValues } from "../validation/destination.schema";
import { ENDPOINTS } from "@/lib/endpoints";

export const getDestinations = async (): Promise<Destination[]> => {
    const response = await axiosClient.get(ENDPOINTS.client.destinations.list);
    return response.data;
};

export const getDestinationById = async (id: string): Promise<Destination> => {
    const destinations = await getDestinations();
    const destination = destinations.find((d) => d._id === id);
    if (!destination) throw new Error("Destination not found");
    return destination;
};

export const createDestination = async (data: DestinationFormValues & { orderNumber: number }): Promise<Destination> => {
    const response = await axiosClient.post(ENDPOINTS.client.destinations.list, data);
    return response.data;
};

export const updateDestination = async (id: string, data: DestinationFormValues): Promise<Destination> => {
    const response = await axiosClient.put(ENDPOINTS.client.destinations.byId(id), data);
    return response.data;
};

export const deleteDestination = async (id: string): Promise<{ message: string }> => {
    const response = await axiosClient.delete(ENDPOINTS.client.destinations.byId(id));
    return response.data;
};

export const moveDestination = async ({ id, direction }: { id: string; direction: "up" | "down" }): Promise<{ message: string }> => {
    const response = await axiosClient.post(ENDPOINTS.client.destinations.move(id), { direction });
    return response.data;
};

export const normalizeDestinationsOrder = async (): Promise<{ message: string }> => {
    const response = await axiosClient.post(ENDPOINTS.client.destinations.normalize, {});
    return response.data;
};
