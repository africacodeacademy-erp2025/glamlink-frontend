"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { getCurrentUser, getCurrentStylistId } from "@/app/api/auth";
import { useBookings } from "@/hooks/use-bookings";
import { useStylistsServices, useAllServices } from "@/hooks/use-stylists-service";
import { getSlotById } from "@/app/api/timeslots";
import {
  Sparkles,
  Scissors,
  CalendarDays,
  Clock,
  Star,
  Heart,
} from "lucide-react";

export default function DashboardPage() {
  const [providerName, setProviderName] = useState<string>("");
  const [isClient, setIsClient] = useState(false);
  const [slotTimes, setSlotTimes] = useState<Record<string, string>>({});
  const [mappedBookings, setMappedBookings] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    "/assets/q.png",
    "/assets/image.png",
    "/assets/Glam-Link.png",
    "/assets/i.png",
  ];

  const slogans = [
    "Where beauty meets business.",
    "Empowering your glow, one booking at a time.",
    "Run your beauty business beautifully.",
    "Simplify your schedule, amplify your sparkle.",
  ];

  // Rotate slideshow
  useEffect(() => {
    const interval = setInterval(
      () => setCurrentSlide((prev) => (prev + 1) % slides.length),
      4000
    );
    return () => clearInterval(interval);
  }, [slides.length]);

  // User info
  useEffect(() => {
    setIsClient(true);
    const user = getCurrentUser();
    setProviderName(user?.name || "Service Provider");
  }, []);

  // Data fetching
  const stylistIdRaw =
    typeof window !== "undefined" ? getCurrentStylistId() : null;
  const stylistId =
    stylistIdRaw !== null && stylistIdRaw !== undefined
      ? String(stylistIdRaw)
      : "";
  const { data: bookings = [], isLoading: bookingsLoading } =
    useBookings(stylistId);
  const { data: stylistServices = [], isLoading: servicesLoading } =
    useStylistsServices(stylistId || "");
  const { data: allServices = [], isLoading: allServicesLoading } =
    useAllServices();

  // Fetch slot times
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
                slotTimeMap[slotId] =
                  slot?.bookingTime || slot?.startTime || slot?.start_time || "";
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

  // Map bookings
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
          ? (stylistService as any).serviceId ??
            (stylistService as any).service_id
          : b.serviceId ?? b.service_id;
        const service = allServices.find(
          (s: any) => String(s.id) === String(mainServiceId)
        );
        const slotId = b.slotId || b.slot_id;
        const slotTime =
          slotId &&
          slotTimes[slotId] &&
          !isNaN(new Date(slotTimes[slotId]).getTime())
            ? slotTimes[slotId]
            : undefined;
        const date = slotTime || b.bookedAt || b.updatedAt;
        return {
          ...b,
          slotDate: slotTime,
          date,
          bookingDate:
            slotTime || b.bookingDate || b.date || b.bookedAt || b.updatedAt,
          dateField: date
            ? new Date(date).toISOString().split("T")[0]
            : undefined,
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

  // Stats
  const totalServices = stylistServices.length;
  const totalBookings = bookings.length;
  const today = new Date().toISOString().slice(0, 10);
  const todayBookings = mappedBookings.filter(
    (b: any) =>
      (b.slotDate || b.date || b.bookingDate || "").slice(0, 10) === today
  ).length;

  const bookingsWithDate = mappedBookings
    .filter((b: any) => {
      const dateVal = b.slotDate || b.date || b.bookingDate;
      return !!dateVal && !isNaN(new Date(dateVal).getTime());
    })
    .sort(
      (a: any, b: any) =>
        new Date(b.slotDate || b.date || b.bookingDate).getTime() -
        new Date(a.slotDate || a.date || a.bookingDate).getTime()
    );

  const previousBookings = bookingsWithDate.filter((b: any) => {
    const dateVal = b.slotDate || b.date || b.bookingDate;
    if (!dateVal) return false;
    const bookingDate = new Date(dateVal);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    return bookingDate < todayDate;
  });

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-50 pb-20 p-4 font-[Poppins]">
      {/* SLIDESHOW */}
      <div className="relative h-64 md:h-80 w-full rounded-2xl overflow-hidden shadow mb-6">
        <Image
          src={slides[currentSlide]}
          alt="Beauty Banner"
          fill
          className="object-cover transition-opacity duration-1000 ease-in-out"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-700/60 via-purple-600/60 to-pink-500/60 animate-[gradient-move_8s_ease_infinite]"></div>

        {/* Text Overlay */}
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center text-white z-10"
        >
          <h2 className="flex items-center justify-center gap-2 text-3xl md:text-4xl font-display">
            {isClient ? `Welcome back, ${providerName}` : "Welcome"}
            <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
          </h2>
          <p className="italic text-pink-100 mt-3 text-sm md:text-lg">
            {slogans[currentSlide]}
          </p>
        </motion.div>

        {/* Dots */}
        <div className="absolute bottom-4 w-full flex justify-center gap-2 z-10">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition ${
                i === currentSlide ? "bg-white" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/70 backdrop-blur-lg border border-pink-200/30 p-4 rounded-2xl text-center shadow flex flex-col items-center gap-1">
          <Scissors className="w-6 h-6 text-pink-500" />
          <p className="text-2xl font-bold">
            {servicesLoading ? "..." : totalServices}
          </p>
          <p className="text-sm text-gray-600">All Services</p>
        </div>
        <div className="bg-white/70 backdrop-blur-lg border border-pink-200/30 p-4 rounded-2xl text-center shadow flex flex-col items-center gap-1">
          <CalendarDays className="w-6 h-6 text-pink-500" />
          <p className="text-2xl font-bold">
            {bookingsLoading ? "..." : totalBookings}
          </p>
          <p className="text-sm text-gray-600">Total Bookings</p>
        </div>
        <div className="bg-white/70 backdrop-blur-lg border border-pink-200/30 p-4 rounded-2xl text-center shadow flex flex-col items-center gap-1">
          <Clock className="w-6 h-6 text-pink-500" />
          <p className="text-2xl font-bold">
            {bookingsLoading ? "..." : todayBookings}
          </p>
          <p className="text-sm text-gray-600">Today</p>
        </div>
        <div className="bg-white/70 backdrop-blur-lg border border-pink-200/30 p-4 rounded-2xl text-center shadow flex flex-col items-center gap-1">
          <Star className="w-6 h-6 text-pink-500" />
          <p className="text-2xl font-bold">
            {bookingsLoading ? "..." : totalBookings - todayBookings}
          </p>
          <p className="text-sm text-gray-600">Upcoming</p>
        </div>
      </div>

      {/* BOOKINGS */}
      <div className="mb-6 w-full">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold">Previous Bookings</h3>
        </div>

        <div className="flex flex-col gap-2">
          {bookingsLoading ? (
            <p>Loading...</p>
          ) : previousBookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Image
                src="/assets/empty-bookings.svg"
                width={100}
                height={100}
                alt="No bookings"
                className="mx-auto mb-3 opacity-80"
              />
              <p>No previous bookings found.</p>
              <Link
                href="/services"
                className="text-pink-500 hover:underline mt-2 inline-block"
              >
                Add your first service 
              </Link>
            </div>
          ) : (
            previousBookings.map((b: any) => (
              <Link
                href="/bookings"
                key={b.id}
                className="flex justify-between items-center bg-white p-3 rounded-xl shadow hover:bg-pink-50 transition"
              >
                <div>
                  <p className="font-medium">
                    {b.customerName ||
                      b.customer_name ||
                      b.client_name ||
                      "Client"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Service: {b.serviceDisplayName}
                  </p>
                  <p className="text-xs text-gray-400">
                    Booking Date: {(b.slotDate || b.date || b.bookingDate || "").slice(0, 10)}
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
