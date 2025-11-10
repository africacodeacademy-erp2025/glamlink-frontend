"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { logout } from "@/lib/api/auth";

export default function Logout() {
  const router = useRouter();
  const { logoutUser } = useAuth();

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Call the logout function from auth.ts (clears localStorage)
        logout();

        // Call the AuthContext logout function (updates state)
        logoutUser();

        // Redirect to home/landing page
        setTimeout(() => {
          router.push("/");
        }, 1000);
      } catch (error) {
        // Still redirect even if there's an error
        router.push("/");
      }
    };

    performLogout();
  }, [router, logoutUser]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-pink-100">
      <div className="bg-white p-8 rounded shadow text-center">
        <h2 className="text-2xl font-bold text-pink-600 mb-4">
          Logging out...
        </h2>
        <p className="text-gray-700">Thank you for choosing GlamLink.</p>
        <div className="mt-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
        </div>
      </div>
    </div>
  );
}
