/**
 * Bookings API
 * Handles all booking-related operations
 */

import apiClient from "./client";
import { getServiceById, fetchServiceNames } from "./stylists-service";
import { getSlotById, fetchSlotTimes } from "./timeslots";

export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
  RESCHEDULED = "RESCHEDULED",
}

export interface Booking {
  id: string;
  serviceId: string;
  slotId: string;
  service?: {
    name: string;
  };
  customerName: string;
  status: BookingStatus | string;
  slot?: {
    startTime: string;
  };
  // Additional fields that might come from backend
  datetime?: string;
  scheduledTime?: string;
  appointmentTime?: string;
  bookedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface CreateBookingData {
  providerId: string;
  bookingNumber: string;
  customerId: string;
  stylistId: string;
  serviceId: string;
  slotId: string;
  status: BookingStatus;
  customerName: string;
  customerPhone: string;
}

export const createBooking = async (data: CreateBookingData) => {
  const res = await apiClient.post(`/bookings`, data);
  return res.data;
};

export const getBookingsByProvider = async (providerId: string) => {
  const res = await apiClient.get(`/bookings/provider/${providerId}`);
  return res.data;
};

export const getBookingsByStylist = async (stylistId: string) => {
  const res = await apiClient.get(`/bookings/provider/${stylistId}`);
  return res.data;
};

export const getBookingById = async (id: string) => {
  const res = await apiClient.get(`/bookings/${id}`);
  return res.data;
};

// Fetch bookings manually
export const fetchBookings = async (
  userId: string | undefined,
  setIsError: (v: boolean) => void,
  setIsLoading: (v: boolean) => void,
  setBookings: (b: Booking[]) => void,
  setServiceNames: (names: { [key: string]: string }) => void,
  setSlotTimes: (times: { [key: string]: string }) => void,
  serviceNames: { [key: string]: string },
  slotTimes: { [key: string]: string }
) => {
  if (!userId) {
    setIsError(true);
    setIsLoading(false);
    return;
  }
  try {
    setIsLoading(true);
    const data = await getBookingsByStylist(userId);
    setBookings(data);
    setIsError(false);
    // Extract service IDs and fetch service names
    const serviceIds = data
      .map((booking: Booking) => booking.serviceId)
      .filter((id: any): id is string => typeof id === "string");
    if (serviceIds.length > 0) {
      await fetchServiceNames(serviceIds, serviceNames, setServiceNames);
    }
    // Extract slot IDs and fetch slot times
    const slotIds = data
      .map((booking: Booking) => booking.slotId)
      .filter((id: any): id is string => typeof id === "string");
    if (slotIds.length > 0) {
      await fetchSlotTimes(slotIds, slotTimes, setSlotTimes);
    }
  } catch (error) {
    setIsError(true);
  } finally {
    setIsLoading(false);
  }
};

export const updateBookingStatus = async (
  id: string,
  status: BookingStatus
) => {
  try {
    // Use the backend's expected PATCH method with request body
    const res = await apiClient.patch(`/bookings/${id}/status`, { status });
    return res.data;
  } catch (error: any) {
    // If CORS blocks the request, the error will be ERR_NETWORK
    if (error.code === "ERR_NETWORK") {
      throw new Error(
        "CORS error: Backend must allow PATCH method in Access-Control-Allow-Methods"
      );
    }

    // If it's a 500 error, the backend has an internal issue
    if (error.response?.status === 500) {
      throw new Error("Backend server error: Unable to update booking status");
    }

    // If it's a 404, the endpoint doesn't exist
    if (error.response?.status === 404) {
      throw new Error(
        "Endpoint not found: Backend may not support status updates"
      );
    }

    throw error;
  }
};

export const rescheduleBooking = async (
  id: string,
  newDateTime: string,
  stylistId: string,
  status: string = "RESCHEDULED"
) => {
  // newDateTime must be a valid ISO string (e.g., "2025-09-25T09:09:00.000Z")
  try {
    const res = await apiClient.patch(`/bookings/${id}/reschedule`, {
      stylistId,
      newStartTime: newDateTime,
      status,
    });
    return res.data;
  } catch (error: any) {
    console.error("Reschedule booking error:", error);
    console.error("Error response:", error.response?.data);
    if (error.code === "ERR_NETWORK") {
      throw new Error(
        "Network error: Please check your connection and try again."
      );
    }
    if (error.response?.status === 404) {
      throw new Error(
        "Reschedule endpoint not found. This feature may not be available."
      );
    }
    if (error.response?.status === 400) {
      throw new Error(
        "Invalid request: The selected time slot may not be available."
      );
    }
    if (error.response?.status === 500) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Server error occurred";
      throw new Error(`Server error: ${message}`);
    }
    throw error;
  }
};

export const cancelBooking = async (id: string) => {
  const res = await apiClient.delete(`/bookings/${id}`);
  return res.data;
};
