/**
 * Booking Fee API
 * Handles stylist booking fee management
 */

import apiClient from "./client";

export async function saveBookingFee(
  stylistId: string,
  bookingFee: number | null
) {
  const res = await apiClient.post(`/stylist-booking-fee`, {
    stylistId,
    bookingFeePercent: bookingFee,
  });
  return res.data;
}

export async function fetchStylistBookingFee(stylistId: string) {
  try {
    const res = await apiClient.get(`/stylist-booking-fee/${stylistId}`);
    return res.data;
  } catch (error: any) {
    // No booking fee found - return null instead of throwing
    if (error.response?.status === 404) {
      return { bookingFeePercent: null };
    }
    throw error;
  }
}

export async function updateStylistBookingFee(
  stylistId: string,
  bookingFee: number | null
) {
  const res = await apiClient.put(`/stylist-booking-fee`, {
    stylistId,
    bookingFeePercent: bookingFee,
  });
  return res.data;
}
