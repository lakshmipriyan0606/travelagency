import axiosClient from '@travelagency/api-client';
import { Destination, DestinationFormValues } from "../validation/destination.schema";

export const getDestinations = async (): Promise<Destination[]> => {
    const response = await axiosClient.get(`/destinations`);
    return response.data;
};

export const getDestinationById = async (id: string): Promise<Destination> => {
    const destinations = await getDestinations();
    const destination = destinations.find((d) => d._id === id);
    if (!destination) throw new Error("Destination not found");
    return destination;
};

export const createDestination = async (data: DestinationFormValues & { orderNumber: number }): Promise<Destination> => {
    const response = await axiosClient.post(`/destinations`, data);
    return response.data;
};

export const updateDestination = async (id: string, data: DestinationFormValues): Promise<Destination> => {
    const response = await axiosClient.put(`/destinations/${id}`, data);
    return response.data;
};

export const deleteDestination = async (id: string): Promise<{ message: string }> => {
    const response = await axiosClient.delete(`/destinations/${id}`);
    return response.data;
};

export const moveDestination = async ({ id, direction }: { id: string; direction: "up" | "down" }): Promise<{ message: string }> => {
    const response = await axiosClient.post(`/destinations/${id}/move`, { direction });
    return response.data;
};

export const normalizeDestinationsOrder = async (): Promise<{ message: string }> => {
    const response = await axiosClient.post(`/destinations/normalize`, {});
    return response.data;
};
