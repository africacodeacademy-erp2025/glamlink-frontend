"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboards/app-sidebar";
import { usePendingBookingsCount } from "@/hooks/use-pending-bookings-count";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const bookingsCount = usePendingBookingsCount();
  return (
    <SidebarProvider>
      <AppSidebar bookingsCount={bookingsCount} />
      <main className="flex-1">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
