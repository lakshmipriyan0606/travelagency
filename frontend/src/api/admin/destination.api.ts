import axiosClient from "../axiosClient";

export const getDestinations = async () => {
    const response = await axiosClient.get("/destinations");
    return response.data;
};

export const createDestination = async (data: any) => {
    const response = await axiosClient.post("/destinations", data);
    return response.data;
};

export const updateDestination = async (id: string, data: any) => {
    const response = await axiosClient.put(`/destinations/${id}`, data);
    return response.data;
};

export const deleteDestination = async (id: string) => {
    const response = await axiosClient.delete(`/destinations/${id}`);
    return response.data;
};

export const moveDestination = async ({ id, direction }: { id: string; direction: "up" | "down" }) => {
    const response = await axiosClient.post(`/destinations/${id}/move`, { direction });
    return response.data;
};

export const normalizeDestinationsOrder = async () => {
    const response = await axiosClient.post("/destinations/normalize", {});
    return response.data;
};
