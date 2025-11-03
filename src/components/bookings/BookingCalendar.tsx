// components/AppointmentCalendar.tsx
"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
//import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Edit } from "lucide-react";
import { Booking, BookingStatus } from "@/lib/api/bookings";

interface BookingCalendarProps {
  bookings: Booking[];
  onBookingSelect: (booking: Booking) => void;
  onEditBooking: (booking: Booking) => void;
  serviceNames: Record<string, string>;
  slotTimes: Record<string, string>;
}

export default function BookingCalendar({
  bookings,
  onBookingSelect,
  onEditBooking,
  serviceNames,
  slotTimes,
}: BookingCalendarProps) {
  // Use the same helpers as BookingList
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
    if (
      booking.slotId &&
      slotTimes &&
      typeof slotTimes === "object" &&
      slotTimes[booking.slotId]
    ) {
      return slotTimes[booking.slotId];
    }
    return "";
  };
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    // Add previous month's days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push(new Date(year, month - 1, prevMonthLastDay - i));
    }

    // Add current month's days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    // Add next month's days
    const totalCells = 42; // 6 weeks
    const daysNeeded = totalCells - days.length;
    for (let i = 1; i <= daysNeeded; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  }, [currentDate]);

  const getBookingsForDate = (date: Date) => {
    return bookings.filter((b) => {
      const bookingDateStr =
        getStartTime(b) || b.bookedAt || b.createdAt || b.updatedAt;
      if (!bookingDateStr) return false;
      const bookingDate = new Date(bookingDateStr);
      return bookingDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
      return newDate;
    });
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.CONFIRMED:
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case BookingStatus.CANCELLED:
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case BookingStatus.COMPLETED:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      default:
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Calendar View</CardTitle>
            <CardDescription>
              {currentDate.toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateMonth("prev")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateMonth("next")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-px bg-border rounded-md overflow-hidden">
          {/* Day headers */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="bg-muted p-3 text-center text-sm font-medium"
            >
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {daysInMonth.map((date, index) => {
            const dayBookings = getBookingsForDate(date);
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <div
                key={index}
                className={`bg-background p-2 min-h-32 ${
                  !isCurrentMonth ? "text-muted-foreground" : ""
                } ${isToday ? "bg-muted/50 border-2 border-primary" : ""}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span
                    className={`text-sm font-medium ${
                      isToday ? "text-primary" : ""
                    }`}
                  >
                    {date.getDate()}
                  </span>
                </div>

                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {dayBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className={`text-xs p-2 rounded border cursor-pointer`}
                      onClick={() => onBookingSelect(booking)}
                    >
                      <div className="flex justify-between items-start">
                        <span
                          className={`text-xs mb-1 px-2 py-0.5 rounded ${getStatusColor(
                            booking.status as BookingStatus
                          )}`}
                        >
                          {booking.status}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditBooking(booking);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="font-medium truncate">
                        {(() => {
                          const timeStr = getStartTime(booking);
                          if (timeStr) {
                            const date = new Date(timeStr);
                            if (!isNaN(date.getTime())) {
                              // Display in UTC to avoid timezone conversion
                              const hours = date.getUTCHours();
                              const minutes = date.getUTCMinutes();
                              const ampm = hours >= 12 ? "PM" : "AM";
                              const displayHours = hours % 12 || 12;
                              return `${String(displayHours).padStart(
                                2,
                                "0"
                              )}:${String(minutes).padStart(2, "0")} ${ampm}`;
                            }
                          }
                          return (
                            <span className="italic text-gray-400">
                              Loading time...
                            </span>
                          );
                        })()}
                      </div>
                      <div className="truncate">
                        {booking.customerName ||
                          booking.client_name ||
                          "Client"}
                      </div>
                      <div className="text-muted-foreground truncate">
                        {getServiceName(booking) !== "Unknown Service" ? (
                          getServiceName(booking)
                        ) : (
                          <span className="italic text-gray-400">
                            Loading service...
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
