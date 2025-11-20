"use client";
import { useState, useEffect } from "react";
import {
  getUserProfileById,
  updateUserProfileById,
  uploadProfilePictureById,
  UserProfile,
} from "@/lib/api/profile";
import { useAuth } from "@/context/AuthContext";
import { WelcomeBanner } from "@/components/dashboards/welcome-banner";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function Profile() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [location, setLocation] = useState("");
  const [country, setCountry] = useState("");
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [subscriptionPlan, setSubscriptionPlan] = useState("");

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

  // Fetch profile
  useEffect(() => {
    if (user?.id) fetchProfile();
    // console.log(user?.id)
    else {
      setLoading(false);
      setError(error);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user?.id) return setError("User ID not available.");
    try {
      setLoading(true);
      const profileData = await getUserProfileById(user.id);
      console.log("Profile data retrieved:", profileData);
      setProfile(profileData);
      setName(profileData.name || "");
      setEmail(profileData.email || "");
      setPhoneNumber(profileData.phoneNumber || "");
      setLocation(profileData.location || "");
      setProfilePic(profileData.profilePicture || null);
      setPaymentMethods(profileData.paymentMethods || []);
      setSubscriptionPlan(profileData.subscriptionPlan || "");
    } catch (err: any) {
      setError(`Unable to load profile data`);
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePicChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!user?.id) return setError("User ID not available.");
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024)
        return setError("File size must be less than 5MB");
      if (!file.type.startsWith("image/"))
        return setError("Please select a valid image file");

      try {
        setUploading(true);
        const profilePictureUrl = await uploadProfilePictureById(user.id, file);
        setProfilePic(profilePictureUrl);
        await updateUserProfileById(user.id, {
          profilePicture: profilePictureUrl,
        });
        setMessage("Profile picture updated!");
        setTimeout(() => setMessage(""), 3000);
      } catch (err: any) {
        setError(`${error}, Failed to upload profile picture`);
        console.log(err.message);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSave = async () => {
    if (!user?.id) return setError("User ID not available.");
    try {
      setSaving(true);
      const updatedProfile = {
        name,
        email,
        phoneNumber,
        location,
        paymentMethods,
        subscriptionPlan,
      };
      await updateUserProfileById(user.id, updatedProfile);
      setMessage("Profile updated successfully!");
      setShowModal(true);
      setTimeout(() => {
        setMessage("");
        setShowModal(false);
      }, 2000);
    } catch (err: any) {
      setMessage(`Failed to save profile`);
      console.log(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-16 p-4 bg-gray-50 min-h-screen">
      <WelcomeBanner
        userName={name || user?.name}
        subtitle="Update your profile information below."
      />

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded shadow-md flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={() => setError("")}
            className="text-sm font-semibold underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white p-8 rounded-3xl shadow-lg max-w-2xl mx-auto flex flex-col items-center gap-6">
        {/* Profile Picture */}
        <div className="relative group">
          <img
            src={profilePic || "/assets/Profile.png"}
            alt="Profile"
            className="w-28 h-28 rounded-full object-cover border-4 border-pink-200 shadow-sm transition-all duration-300 group-hover:scale-105"
          />
          <label
            className={`absolute bottom-0 right-0 bg-pink-500 text-white p-2 rounded-full cursor-pointer shadow-lg transition-all duration-300 group-hover:bg-pink-600 ${uploading ? "opacity-50" : ""}`}
          >
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProfilePicChange}
              disabled={uploading}
            />
            {uploading ? "⏳" : "✎"}
          </label>
        </div>

        {/* Form Fields Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving}
              className="w-full border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={saving}
              className="w-full border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Phone
            </label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={saving}
              className="w-full border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300"
              placeholder="Enter your phone number"
            />
          </div>

          {/* Read-only Country */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Country
            </label>
            <span className="inline-block w-full p-3 rounded-xl bg-gray-100 text-gray-700 cursor-not-allowed border">
              {country}
            </span>
          </div>

          {/* User-entered Location */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={saving}
              className="w-full border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300"
              placeholder="Enter your location"
            />
          </div>
          {/* Country dropdown removed as requested */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Subscription Plan
            </label>
            <select
              value={subscriptionPlan}
              onChange={(e) => setSubscriptionPlan(e.target.value)}
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-pink-300 font-semibold"
              disabled={saving}
              required
            >
              <option value="">Select Plan</option>
              <option value="Free">Free</option>
              <option value="Basic">Basic</option>
            </select>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className={`mt-4 w-full py-3 rounded-2xl text-white font-semibold text-lg transition ${
            saving
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-pink-500 hover:bg-pink-600"
          }`}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

        {/* Success Toast */}
        {message && (
          <div className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg animate-fade-in-out">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
