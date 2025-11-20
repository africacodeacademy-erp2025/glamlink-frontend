"use client";
import BookingManager from "@/components/bookings/BookingManager";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function BookingsPage() {
  return (
    <ProtectedRoute>
      <BookingManager />
    </ProtectedRoute>
  );
}
