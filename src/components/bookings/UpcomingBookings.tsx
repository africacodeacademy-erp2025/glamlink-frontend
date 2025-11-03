// components/UpcomingAppointments.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Send, Loader2 } from "lucide-react";
import { Booking, BookingStatus } from "@/lib/api/bookings";

interface UpcomingBookingsProps {
  bookings: Booking[];
  onEdit: (booking: Booking) => void;
  onSendReminder?: (id: string) => void;
}

export default function UpcomingBookings({
  bookings,
  onEdit,
  onSendReminder,
}: UpcomingBookingsProps) {
  // Filter bookings for the next 7 days
  const now = new Date();
  const sevenDaysFromNow = new Date(now);
  sevenDaysFromNow.setDate(now.getDate() + 7);
  const upcomingBookings = (bookings || []).filter((b: Booking) => {
    const date = new Date(b.bookedAt || b.date || b.slotDate || "");
    return date >= now && date <= sevenDaysFromNow;
  });
  const loading = false;

  const getTimeUntilBooking = (dateStr: string) => {
    const now = new Date();
    const bookingTime = new Date(dateStr);
    const diffMs = bookingTime.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    if (diffDays > 0) {
      return `${diffDays}d ${diffHours}h`;
    } else if (diffHours > 0) {
      return `${diffHours}h`;
    } else {
      return "Soon";
    }
  };

  const getUrgencyColor = (dateStr: string) => {
    const now = new Date();
    const bookingTime = new Date(dateStr);
    const diffHours =
      (bookingTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (diffHours < 24) return "text-red-600 bg-red-100";
    if (diffHours < 48) return "text-orange-600 bg-orange-100";
    return "text-green-600 bg-green-100";
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center p-8">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-muted-foreground">
              Loading upcoming bookings...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Bookings</CardTitle>
        <CardDescription>
          Bookings scheduled for the next 7 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Time Until</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">
                    {booking.customerName || booking.client_name || "Client"}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {new Date(
                        booking.bookedAt || booking.date || booking.slotDate
                      ).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(
                        booking.bookedAt || booking.date || booking.slotDate
                      ).toLocaleTimeString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={getUrgencyColor(
                        booking.bookedAt || booking.date || booking.slotDate
                      )}
                    >
                      {getTimeUntilBooking(
                        booking.bookedAt || booking.date || booking.slotDate
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {booking.serviceDisplayName || booking.serviceName || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        booking.status === BookingStatus.CONFIRMED
                          ? "default"
                          : "outline"
                      }
                    >
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(booking)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {upcomingBookings.length === 0 && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            No upcoming bookings in the next 7 days.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
