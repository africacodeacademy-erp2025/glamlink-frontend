// hooks/useBookings.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createBooking,
  getBookingsByProvider,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
} from "@/lib/api/bookings";
enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
  RESCHEDULED = "RESCHEDULED",
}

export function useBookings(providerId: string) {
  return useQuery({
    queryKey: ["bookings", providerId],
    queryFn: () => getBookingsByProvider(providerId),
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ["booking", id],
    queryFn: () => getBookingById(id),
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createBooking,
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["bookings", variables.providerId] });
    },
  });
}

export function useUpdateBookingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) =>
      updateBookingStatus(id, status),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["booking", variables.id] });
    },
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelBooking(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["booking", id] });
    },
  });
}
