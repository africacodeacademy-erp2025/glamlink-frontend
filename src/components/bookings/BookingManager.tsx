// components/AppointmentManager.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, List, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Booking,
  BookingStatus,
  fetchBookings as fetchBookingsApi,
  updateBookingStatus,
  rescheduleBooking,
  cancelBooking,
} from "@/lib/api/bookings";
import { useAuth } from "@/context/AuthContext";
import BookingCalendar from "./BookingCalendar";
import BookingList from "./BookingList";

import { updateSlotBookedStatus } from "@/lib/api/timeslots";
import UpcomingBookings from "./UpcomingBookings";
import { useQueryClient } from "@tanstack/react-query";

export default function BookingManager() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  // Reschedule state
  const [rescheduleBookingId, setRescheduleBookingId] = useState<string | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [serviceNames, setServiceNames] = useState<Record<string, string>>({});
  const [slotTimes, setSlotTimes] = useState<Record<string, string>>({});

  // Helper functions (from BookingsPage)
  const getServiceName = (booking: Booking): string => {
    if (booking.serviceId && serviceNames[booking.serviceId]) {
      return serviceNames[booking.serviceId];
    }
    if (
      booking.service &&
      typeof booking.service === "object" &&
      "name" in booking.service
    ) {
      return booking.service.name;
    }
    return "Unknown Service";
  };

  const getStartTime = (booking: Booking): string => {
    if (booking.slotId && slotTimes[booking.slotId]) {
      return slotTimes[booking.slotId];
    }
    return "";
  };

  const formatBookingDate = (booking: Booking): string => {
    const slotDateStr =
      getStartTime(booking) ||
      booking.bookedAt ||
      booking.createdAt ||
      booking.updatedAt;
    if (slotDateStr) {
      const date = new Date(slotDateStr);
      if (!isNaN(date.getTime())) {
        return date.toLocaleString("en-US");
      }
    }
    return "";
  };

  // Reschedule booking action
  const rescheduleBookingAction = async (id: string, newDateTime: string) => {
    try {
      if (typeof user?.id === "string") {
        await rescheduleBooking(
          id,
          newDateTime,
          user.id,
          BookingStatus.RESCHEDULED
        );
        toast.success("Booking rescheduled successfully!");
        await fetchBookings(user.id);
        // Invalidate queries to refresh dashboard
        queryClient.invalidateQueries({ queryKey: ["bookings", user.id] });
      } else {
        throw new Error("User ID is not available for rescheduling booking.");
      }
    } catch (error) {
      toast.error("Failed to reschedule booking");
    }
  };

  // Reschedule helpers
  const handleCancelReschedule = () => {
    setRescheduleBookingId(null);
    setSelectedDate("");
    setSelectedTime("");
  };

  const handleRescheduleClick = (booking: Booking) => {
    setRescheduleBookingId(booking.id);
    // Always display the booking's current date and time
    const startTime = getStartTime(booking);
    if (startTime) {
      const date = new Date(startTime);
      if (!isNaN(date.getTime())) {
        setSelectedDate(date.toISOString().split("T")[0]);
        setSelectedTime(date.toTimeString().slice(0, 5));
      } else {
        setSelectedDate("");
        setSelectedTime("");
      }
    } else {
      setSelectedDate("");
      setSelectedTime("");
    }
  };

  const handleSaveReschedule = () => {
    if (!rescheduleBookingId || !selectedDate || !selectedTime) return;
    const newDateTime = `${selectedDate}T${selectedTime}:00.000Z`;
    rescheduleBookingAction(rescheduleBookingId, newDateTime);
    handleCancelReschedule();
  };

  // Fetch bookings using the new API utility
  const fetchBookings = async (userId: string | undefined) => {
    try {
      setLoading(true);
      await fetchBookingsApi(
        userId,
        () => {}, // setIsError (optional, not used here)
        setLoading,
        setBookings,
        setServiceNames,
        setSlotTimes,
        serviceNames,
        slotTimes
      );
    } catch (error) {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.id) {
      fetchBookings(user.id);
    }
  }, [authLoading, isAuthenticated, user?.id]);

  // Booking action handlers
  const confirmBooking = async (id: string) => {
    try {
      await updateBookingStatus(id, BookingStatus.CONFIRMED);
      const booking = bookings.find((b) => b.id === id);
      // Optionally update slot status if needed
      // if (booking && booking.slotId) {
      //   await updateSlotBookedStatus(booking.slotId, true);
      // }
      toast.success("Booking confirmed successfully!");
      if (user?.id) {
        await fetchBookings(user.id);
        // Invalidate queries to refresh dashboard
        queryClient.invalidateQueries({ queryKey: ["bookings", user.id] });
      }
    } catch (error) {
      toast.error("Failed to confirm booking");
    }
  };

  const cancelBookingAction = async (id: string) => {
    try {
      await cancelBooking(id);
      toast.success("Booking cancelled successfully!");
      if (user?.id) {
        await fetchBookings(user.id);
        // Invalidate queries to refresh dashboard
        queryClient.invalidateQueries({ queryKey: ["bookings", user.id] });
      }
    } catch (error) {
      toast.error("Failed to cancel booking");
    }
  };

  const completeBooking = async (id: string) => {
    try {
      await updateBookingStatus(id, BookingStatus.COMPLETED);
      toast.success("Booking marked as completed!");
      if (user?.id) {
        await fetchBookings(user.id);
        // Invalidate queries to refresh dashboard
        queryClient.invalidateQueries({ queryKey: ["bookings", user.id] });
      }
    } catch (error) {
      toast.error("Failed to complete booking");
    }
  };

  // Stats for dashboard cards
  const getStats = () => {
    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const todayDateString = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const todayBookings = bookings.filter((b) => {
      // Get the slot start_time for this booking
      const slotId = b.slotId || b.slot_id;
      if (!slotId || !slotTimes[slotId]) {
        return false; // Skip if no slot time available
      }

      const startTime = slotTimes[slotId];
      // Extract just the date part (YYYY-MM-DD) from the slot time
      const bookingDateString = startTime.split("T")[0];

      // Compare just the date strings
      return bookingDateString === todayDateString;
    });

    return {
      total: bookings.length,
      today: todayBookings.length,
      confirmed: bookings.filter((b) => b.status === BookingStatus.CONFIRMED)
        .length,
      pending: bookings.filter((b) => b.status === BookingStatus.PENDING)
        .length,
    };
  };

  const stats = getStats();

  if (loading && bookings.length === 0) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading bookings...</p>
        </div>
      </div>
    );
  }

  // Debug logging for data population
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-6 p-4 bg-pink-500 rounded shadow text-white">
          <div>
            <h1 className="text-lg font-bold">Booking Management</h1>

            <p className="text-gray-200">Manage and schedule client bookings</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-pink-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Bookings
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="bg-pink-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Today's Bookings
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.today}</div>
            </CardContent>
          </Card>
          <Card className="bg-pink-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <Badge variant="default">CONFIRMED</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.confirmed}</div>
            </CardContent>
          </Card>
          <Card className="bg-pink-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Badge variant="secondary">PENDING</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle>Bookings Overview</CardTitle>
            <CardDescription>
              View and manage all bookings in different formats
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="calendar" className="space-y-4">
              <TabsList>
                <TabsTrigger
                  value="calendar"
                  className="flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Calendar View
                </TabsTrigger>
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  List View
                </TabsTrigger>
                <TabsTrigger
                  value="upcoming"
                  className="flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  Upcoming
                </TabsTrigger>
              </TabsList>

              <TabsContent value="calendar" className="space-y-4">
                <BookingCalendar
                  bookings={bookings}
                  onBookingSelect={setSelectedBooking}
                  onEditBooking={() => {}}
                  serviceNames={serviceNames}
                  slotTimes={slotTimes}
                />
              </TabsContent>

              <TabsContent value="list" className="space-y-4">
                <BookingList
                  bookings={bookings}
                  onConfirm={confirmBooking}
                  onCancel={cancelBookingAction}
                  onReschedule={handleRescheduleClick}
                  onComplete={completeBooking}
                  serviceNames={serviceNames}
                  slotTimes={slotTimes}
                />
              </TabsContent>

              <TabsContent value="upcoming" className="space-y-4">
                <UpcomingBookings bookings={bookings} onEdit={() => {}} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        {/* Reschedule Modal */}
        {rescheduleBookingId !== null && (
          <div className="fixed inset-0 bg-pink bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow w-80">
              <h3 className="text-lg font-bold mb-4">Reschedule Booking</h3>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Select Date
              </label>
              <input
                type="date"
                className="border p-2 rounded w-full mb-4"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Select Time
              </label>
              <input
                type="time"
                className="border p-2 rounded w-full mb-4"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleCancelReschedule}
                  className="px-3 py-1 rounded border hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveReschedule}
                  className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
