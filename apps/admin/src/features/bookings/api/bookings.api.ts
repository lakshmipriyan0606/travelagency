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

/** sendSuccess flattens `{ bookings }` onto the envelope; arrays land under `.data`. */
function unwrapBookings(payload: unknown): Booking[] {
  if (!payload || typeof payload !== 'object') {
    return Array.isArray(payload) ? (payload as Booking[]) : [];
  }
  const body = payload as { bookings?: unknown; data?: unknown };
  if (Array.isArray(body.bookings)) return body.bookings as Booking[];
  if (Array.isArray(body.data)) return body.data as Booking[];
  if (Array.isArray(payload)) return payload as Booking[];
  return [];
}

export const getBookings = async (): Promise<BookingResponse> => {
  const response = await axiosClient.get(ENDPOINTS.client.bookings.admin);
  return { bookings: unwrapBookings(response.data) };
};
