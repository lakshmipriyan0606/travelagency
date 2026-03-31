import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const getDestinations = async () => {
    const response = await axios.get(`${API_URL}/destinations`);
    return response.data;
};

export const createDestination = async (data: any) => {
    const response = await axios.post(`${API_URL}/destinations`, data, { withCredentials: true });
    return response.data;
};

export const updateDestination = async (id: string, data: any) => {
    const response = await axios.put(`${API_URL}/destinations/${id}`, data, { withCredentials: true });
    return response.data;
};

export const deleteDestination = async (id: string) => {
    const response = await axios.delete(`${API_URL}/destinations/${id}`, { withCredentials: true });
    return response.data;
};

export const moveDestination = async ({ id, direction }: { id: string; direction: "up" | "down" }) => {
    const response = await axios.post(`${API_URL}/destinations/${id}/move`, { direction }, { withCredentials: true });
    return response.data;
};

export const normalizeDestinationsOrder = async () => {
    const response = await axios.post(`${API_URL}/destinations/normalize`, {}, { withCredentials: true });
    return response.data;
};
