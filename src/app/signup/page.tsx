"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { register } from "@/lib/api/auth";
import SubscriptionPlans from "@/components/general/SubscriptionPlans";

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Form states
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [location, setLocation] = useState("");

  // Plan selection
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Country detection
  const [country, setCountry] = useState("");

  // Detect user country
  useEffect(() => {
    const detectCountry = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        if (data?.country_name) setCountry(data.country_name);
      } catch (err) {
        console.error("Failed to detect country:", err);
      }
    };
    detectCountry();
  }, []);

  // Feedback & errors
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Background slideshow
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    "/assets/banner-1.png",
    "/assets/banner-2.png",
    "/assets/banner-3.png",
  ];

  // Auto slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slides.length]);

  // Check URL for pre-selected plan
  useEffect(() => {
    const plan = searchParams.get("plan");
    if (plan) setSelectedPlan(plan);
  }, [searchParams]);

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning!";
    if (hour < 18) return "Good afternoon!";
    return "Good evening!";
  })();

  // Validate form before submit
  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!fullName.trim()) errors.fullName = "Full name is required.";
    if (!phone.trim()) errors.phone = "Phone number is required.";
    else if (!/^[0-9]+$/.test(phone))
      errors.phone = "Phone must contain only digits.";
    if (!email.trim()) errors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.email = "Invalid email format.";
    if (!location.trim()) errors.location = "Location is required.";
    if (!password) errors.password = "Password is required.";
    else if (password.length < 10)
      errors.password = "Password must be at least 10 characters.";
    if (password !== confirmPassword)
      errors.confirmPassword = "Passwords do not match.";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      await register({
        name: fullName,
        email,
        phoneNumber: phone,
        password,
        location,
        subscription_plan: selectedPlan || "Free",
        country: country || "", // Use detected country
      });
      setIsSuccess(true);
      setTimeout(() => router.push("/login"), 1000);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden">
      {/* Background Slideshow */}
      <div className="absolute inset-0 z-0">
        {slides.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`Slide ${index}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-pink-300/5"></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl px-4 py-10">
        {!selectedPlan && <SubscriptionPlans />}

        {selectedPlan && (
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8 mt-10 flex flex-col items-center w-full max-w-md mx-auto transition-transform hover:scale-[1.02] duration-300">
            <div className="mb-6 p-4 bg-pink-500 rounded shadow text-white w-full text-center">
              <h2 className="text-lg font-bold">{greeting}</h2>
              <p className="text-pink-200">Join GlamLink today!</p>
            </div>

            <h1 className="text-3xl font-bold text-pink-600 mb-4">
              Create Account
            </h1>

            <div className="mb-4 p-3 border rounded-lg bg-pink-50 text-center w-full">
              <p className="text-sm text-gray-700">
                Selected Plan:{" "}
                <span className="font-semibold text-pink-600">
                  {selectedPlan}
                </span>
              </p>
              <button
                onClick={() => setSelectedPlan(null)}
                className="mt-2 text-xs text-pink-500 hover:underline"
              >
                Change Plan
              </button>
            </div>

            {error && <p className="text-red-500 mb-3 text-sm">{error}</p>}
            {isSuccess && (
              <p className="text-green-600 mb-3 text-sm">
                Account created! Redirecting...
              </p>
            )}

            <form
              className="w-full flex flex-col gap-3"
              onSubmit={handleSignUp}
            >
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                disabled={isLoading}
              />
              {fieldErrors.fullName && (
                <p className="text-red-500 text-sm">{fieldErrors.fullName}</p>
              )}

              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                disabled={isLoading}
              />
              {fieldErrors.phone && (
                <p className="text-red-500 text-sm">{fieldErrors.phone}</p>
              )}

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                disabled={isLoading}
              />
              {fieldErrors.email && (
                <p className="text-red-500 text-sm">{fieldErrors.email}</p>
              )}

              <input
                type="text"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                disabled={isLoading}
              />
              {fieldErrors.location && (
                <p className="text-red-500 text-sm">{fieldErrors.location}</p>
              )}

              <input
                type="password"
                placeholder="Password (min 10 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                disabled={isLoading}
              />
              {fieldErrors.password && (
                <p className="text-red-500 text-sm">{fieldErrors.password}</p>
              )}

              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full mb-2 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                disabled={isLoading}
              />
              {fieldErrors.confirmPassword && (
                <p className="text-red-500 text-sm">
                  {fieldErrors.confirmPassword}
                </p>
              )}

              <button
                type="submit"
                className="bg-pink-600 text-white px-6 py-3 rounded-lg w-full hover:bg-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Sign Up"}
              </button>
            </form>

            <p className="mt-4 text-sm text-gray-600">
              Already have an account?{" "}
              <span
                className="text-pink-500 cursor-pointer hover:underline"
                onClick={() => router.push("/login")}
              >
                Sign In
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-pink-100 p-4 flex items-center justify-center">
          <div className="text-pink-600">Loading...</div>
        </div>
      }
    >
      <SignUpForm />
    </Suspense>
  );
}
