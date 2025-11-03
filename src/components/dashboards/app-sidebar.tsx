"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Inbox,
  LayoutDashboard,
  Calendar,
  Search,
  User,
  LogOut,
  CreditCard,
} from "lucide-react";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Services", url: "/dashboard/services", icon: Search },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "Bookings", url: "/dashboard/booking", icon: Inbox },
  { title: "Payment Method", url: "/dashboard/payment-method", icon: CreditCard },
  { title: "Profile", url: "/profile", icon: User },
  { title: "Logout", url: "/logout", icon: LogOut },
];

export function AppSidebar({ bookingsCount }: { bookingsCount?: number }) {
  const pathname = usePathname();

  return (
    <Sidebar className="bg-gradient-to-b from-pink-50 via-white to-pink-100 border-r border-pink-200 shadow-md">
      <SidebarContent>

        {/* Brand Header */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-pink-100">
          <img
            src="/assets/logo.png"
            alt="GlamLink Logo"
            className="h-10 w-10 rounded-full shadow-sm"
          />
          <span className="text-pink-600 font-bold text-lg tracking-wide">
            GlamLink
          </span>
        </div>

        {/*  Application Links */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500 text-sm font-semibold px-4 pt-4 uppercase tracking-wider">
            Application
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item, idx) => {
                const isActive = pathname === item.url;
                const hasNotification =
                  item.title === "Bookings" &&
                  typeof bookingsCount === "number" &&
                  bookingsCount > 0;

                return (
                  <SidebarMenuItem key={item.title + "-" + idx}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.url}
                        className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-all duration-300
                          ${
                            isActive
                              ? "bg-pink-100 text-pink-700 font-semibold shadow-inner"
                              : "text-gray-700 hover:bg-pink-50 hover:text-pink-600"
                          }`}
                      >
                        <item.icon
                          className={`w-5 h-5 transition-colors duration-300 ${
                            isActive
                              ? "text-pink-600"
                              : "text-gray-500 group-hover:text-pink-500"
                          }`}
                        />
                        <span>{item.title}</span>

                        {hasNotification && (
                          <span className="ml-auto bg-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                            {bookingsCount}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <div className="text-center text-xs text-gray-400 py-4 border-t border-pink-100">
        © {new Date().getFullYear()}{" "}
        <span className="text-pink-500 font-semibold">GlamLink</span>
      </div>
    </Sidebar>
  );
}
