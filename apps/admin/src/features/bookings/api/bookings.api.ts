import axiosClient from '@/lib/apiClient';
import { ENDPOINTS } from '@/lib/endpoints';

export interface Booking {
  _id: string;
  bookingId: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  city: string;
  destination: string;
  packageName?: string;
  travelDate: string;
  travelMonth?: string;
  vacationType?: string;
  noOfPeople?: number;
  message?: string;
  createdAt?: string;
  sheetSyncStatus?: string;
  userEmailStatus?: string;
  adminEmailStatus?: string;
  errorLogs?: { task: string; message: string; timestamp: string }[];
}

export interface BookingResponse {
  bookings: Booking[];
}

export const getBookings = async (): Promise<BookingResponse> => {
  const response = await axiosClient.get(ENDPOINTS.client.bookings.admin);
  return response.data;
};
