"use client";
import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { getCurrentUser, getCurrentStylistId } from "@/app/api/auth";
import { useBookings } from "@/hooks/use-bookings";
import { useStylistsServices, useAllServices } from "@/hooks/use-stylists-service";
import { getSlotById } from "@/app/api/timeslots";
import Tour from '@/components/ui/ruixen-tour';

export default function DashboardPage() {
  const [providerName, setProviderName] = useState<string>("");
  const [isClient, setIsClient] = useState(false);
  const [slotTimes, setSlotTimes] = useState<Record<string, string>>({});
  const [mappedBookings, setMappedBookings] = useState<any[]>([]);

  useEffect(() => {
    setIsClient(true);
    const user = getCurrentUser();
    setProviderName(user?.name || "Service Provider");
  }, []);

  const stylistIdRaw = typeof window !== 'undefined' ? getCurrentStylistId() : null;
  const stylistId = stylistIdRaw !== null && stylistIdRaw !== undefined ? String(stylistIdRaw) : "";
  const { data: bookings = [], isLoading: bookingsLoading } = useBookings(stylistId);
  const { data: stylistServices = [], isLoading: servicesLoading } = useStylistsServices(stylistId || "");
  const { data: allServices = [], isLoading: allServicesLoading } = useAllServices();

  // Fetch slot start times for all bookings
  useEffect(() => {
    const fetchSlotTimes = async () => {
      if (!bookingsLoading && Array.isArray(bookings)) {
        const slotTimeMap: Record<string, string> = {};
        await Promise.all(
          bookings.map(async (b: any) => {
            const slotId = b.slotId || b.slot_id;
            if (slotId && !slotTimeMap[slotId]) {
              try {
                const slot = await getSlotById(slotId);
                // Always prefer bookingTime, then startTime, then start_time
                slotTimeMap[slotId] = slot?.bookingTime || slot?.startTime || slot?.start_time || "";
              } catch {
                slotTimeMap[slotId] = "";
              }
            }
          })
        );
        setSlotTimes(slotTimeMap);
      }
    };
    fetchSlotTimes();
  }, [bookings, bookingsLoading]);

  useEffect(() => {
    if (
      !servicesLoading &&
      !allServicesLoading &&
      !bookingsLoading &&
      Array.isArray(bookings) &&
      Array.isArray(stylistServices) &&
      Array.isArray(allServices)
    ) {
      const mapped = bookings.map((b: any) => {
        const stylistService = stylistServices.find(
          (s: any) =>
            String((s as any).serviceId ?? (s as any).service_id) ===
            String(b.serviceId ?? b.service_id)
        );
        const mainServiceId = stylistService
          ? (stylistService as any).serviceId ?? (stylistService as any).service_id
          : b.serviceId ?? b.service_id;
        const service = allServices.find((s: any) => String(s.id) === String(mainServiceId));
        const slotId = b.slotId || b.slot_id;
        const slotTime = slotId && slotTimes[slotId] && !isNaN(new Date(slotTimes[slotId]).getTime())
          ? slotTimes[slotId]
          : undefined;
        // Always use slotTime as the date if available
        const date = slotTime || b.bookedAt || b.updatedAt;
        return {
          ...b,
          slotDate: slotTime,
          date,
          bookingDate: slotTime || b.bookingDate || b.date || b.bookedAt || b.updatedAt,
          dateField: date ? new Date(date).toISOString().split("T")[0] : undefined,
          serviceDisplayName: service?.name || "Unknown Service",
        };
      });
      setMappedBookings(mapped);
    }
  }, [
    bookings,
    stylistServices,
    allServices,
    bookingsLoading,
    servicesLoading,
    allServicesLoading,
    slotTimes,
  ]);
  // Calculate stats
  const totalServices = stylistServices.length;
  const totalBookings = bookings.length;
  const today = new Date().toISOString().slice(0, 10);
  const todayBookings = mappedBookings.filter(
    (b: any) => (b.slotDate || b.date || b.bookingDate || "").slice(0, 10) === today
  ).length;
  // Show ALL bookings with a valid booking date (from slot or fallback)
  const bookingsWithDate = mappedBookings
    .filter((b: any) => {
      const dateVal = b.slotDate || b.date || b.bookingDate;
      return !!dateVal && !isNaN(new Date(dateVal).getTime());
    })
    .sort((a: any, b: any) => {
      const aDate = new Date(a.slotDate || a.date || a.bookingDate).getTime();
      const bDate = new Date(b.slotDate || b.date || b.bookingDate).getTime();
      return bDate - aDate;
    });
  // Previous bookings: only those with date before today
  const previousBookings = bookingsWithDate.filter((b: any) => {
    const dateVal = b.slotDate || b.date || b.bookingDate;
    if (!dateVal) return false;
    const bookingDate = new Date(dateVal);
    const todayDate = new Date();
    // Remove time part for today comparison
    todayDate.setHours(0, 0, 0, 0);
    return bookingDate < todayDate;
  });
  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-50 pb-20 p-4">
      <Tour />
      <div className="bg-pink-500 text-white p-10 rounded-2xl shadow mb-6 text-center w-full">
        <p className="mt-2 text-lg">
          {isClient ? <>Welcome back, {providerName} 👋</> : <span>&nbsp;</span>}
        </p>
        <p className="mt-3 text-sm opacity-90">
          Manage your bookings and services with ease ✨
        </p>
      </div>
      {/* --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-pink-100 p-4 rounded-xl text-center shadow">
          <p className="text-2xl font-bold">{servicesLoading ? "..." : totalServices}</p>
          <p className="text-sm">All Services Offered</p>
        </div>
        <div className="bg-pink-100 p-4 rounded-xl text-center shadow">
          <p className="text-2xl font-bold">{bookingsLoading ? "..." : totalBookings}</p>
          <p className="text-sm">All Bookings</p>
        </div>
        <div className="bg-pink-100 p-4 rounded-xl text-center shadow">
          <p className="text-2xl font-bold">{bookingsLoading ? "..." : todayBookings}</p>
          <p className="text-sm">Bookings Today</p>
        </div>
        <div className="bg-pink-100 p-4 rounded-xl text-center shadow">
          <p className="text-2xl font-bold">{bookingsLoading ? "..." : totalBookings - todayBookings}</p>
          <p className="text-sm">Other Bookings</p>
        </div>
      </div>

      {/* Previous Bookings */}
      <div className="mb-6 w-full">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold">Previous Bookings</h3>
        </div>
        <div className="flex flex-col gap-2">
          {bookingsLoading ? (
            <p>Loading...</p>
          ) : previousBookings.length === 0 ? (
            <p className="text-gray-500">No previous bookings found.</p>
          ) : (
            previousBookings.map((b: any) => (
              <Link
                href="/bookings"
                key={b.id}
                className="flex justify-between items-center bg-white p-3 rounded-xl shadow hover:bg-pink-50 transition"
              >
                <div>
                  <p className="font-medium">
                    {b.customerName || b.customer_name || b.client_name || "Client"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Service: {b.serviceDisplayName}
                  </p>
                  <p className="text-xs text-gray-400">
                    Booking Date: {(b.slotDate || b.date || b.bookingDate || "").slice(0, 10)}{" "}
                    {(() => {
                      const dateVal = b.slotDate || b.date || b.bookingDate;
                      if (!dateVal) return "";
                      const d = new Date(dateVal);
                      return !isNaN(d.getTime())
                        ? d.toLocaleTimeString("en-US", {
                            timeZone: "UTC",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          }) + " UTC"
                        : "";
                    })()}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      (b.status || "").toLowerCase() === "confirmed" ||
                      (b.status || "").toLowerCase() === "complete"
                        ? "bg-green-100 text-green-600"
                        : (b.status || "").toLowerCase() === "pending"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}


