"use client";
import React, { useState, useEffect } from "react";
import {
  fetchStylistPaymentMethods,
  savePaymentMethod,
  EditPaymentMethod,
  deletePaymentMethod,
} from "@/lib/api/payment-method";
import {
  fetchStylistBookingFee,
  saveBookingFee,
  updateStylistBookingFee,
} from "@/lib/api/bookingFee";
import { useAuth } from "@/context/AuthContext";

export default function PaymentMethodPage() {
  const { user } = useAuth();
  const [paymentName, setMethodName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingMethodName, setEditingMethodName] = useState("");
  const [editingAccountNumber, setEditingAccountNumber] = useState("");
  const [bookingFee, setBookingFee] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [feeLoading, setFeeLoading] = useState(false);
  const [feeError, setFeeError] = useState("");
  const [success, setSuccess] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState("");
  const [error, setError] = useState("");
  const [stylistMethods, setStylistMethods] = useState<any[]>([]);
  const [methodsLoading, setMethodsLoading] = useState(false);
  const [editingFee, setEditingFee] = useState(false);
  const [editingBookingFee, setEditingBookingFee] = useState<number | null>(
    null
  );
  const [newBookingFee, setNewBookingFee] = useState<number | null>(null);

  useEffect(() => {
    const fetchStylist = async () => {
      if (!user?.id) return;
      setMethodsLoading(true);
      const data = await fetchStylistPaymentMethods(String(user.id));
      setStylistMethods(Array.isArray(data) ? data : []);
      setMethodsLoading(false);
    };
    fetchStylist();
  }, [user]);

  useEffect(() => {
    const fetchFee = async () => {
      if (!user?.id) return;
      setFeeLoading(true);
      setFeeError("");
      try {
        const data = await fetchStylistBookingFee(user.id);
        setBookingFee(data.bookingFeePercent ?? null);
      } catch (err: any) {
        setBookingFee(null);
        if (err.message !== "Failed to fetch booking fee") {
          setFeeError("Could not load booking fee.");
        }
      } finally {
        setFeeLoading(false);
      }
    };
    fetchFee();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPaymentSuccess("");
    setError("");
    try {
      if (!user?.id) throw new Error("User not found");
      await savePaymentMethod(String(user.id), paymentName, accountNumber);
      setPaymentSuccess("Payment method saved!");
      setMethodName("");
      setAccountNumber("");
      const data = await fetchStylistPaymentMethods(String(user.id));
      setStylistMethods(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Failed to save payment method");
    } finally {
      setLoading(false);
    }
  };

  const handleBookingFeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeeLoading(true);
    setFeeError("");
    setSuccess("");
    try {
      if (!user?.id) throw new Error("User not found");
      await saveBookingFee(user.id, newBookingFee);
      setBookingFee(newBookingFee);
      setNewBookingFee(null);
      setSuccess("Booking fee saved!");
    } catch (err: any) {
      setFeeError(err.message || "Failed to save booking fee");
    } finally {
      setFeeLoading(false);
    }
  };

  const handleEdit = (method: any) => {
    setEditingId(method.id ?? null);
    setEditingMethodName(method.paymentName || "");
    setEditingAccountNumber(method.accountNumber || "");
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setLoading(true);
    setError("");
    setPaymentSuccess("");
    try {
      await EditPaymentMethod(
        editingId,
        editingMethodName,
        editingAccountNumber
      );
      setEditingId(null);
      setEditingMethodName("");
      setEditingAccountNumber("");
      setPaymentSuccess("Payment method updated successfully!");
      if (user?.id) {
        const data = await fetchStylistPaymentMethods(String(user.id));
        setStylistMethods(Array.isArray(data) ? data : []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to edit payment method");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    setError("");
    setPaymentSuccess("");
    try {
      await deletePaymentMethod(id);
      setPaymentSuccess("Payment method deleted successfully!");
      if (user?.id) {
        const data = await fetchStylistPaymentMethods(String(user.id));
        setStylistMethods(Array.isArray(data) ? data : []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete payment method");
    } finally {
      setLoading(false);
    }
  };

  const handleEditFee = () => {
    setEditingFee(true);
    setEditingBookingFee(bookingFee);
  };

  const handleEditFeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeeLoading(true);
    setFeeError("");
    setSuccess("");
    try {
      if (!user?.id) throw new Error("User not found");
      await updateStylistBookingFee(user.id, editingBookingFee);
      setBookingFee(editingBookingFee);
      setEditingFee(false);
      setSuccess("Booking fee updated successfully!");
    } catch (err: any) {
      setFeeError(err.message || "Failed to update booking fee");
    } finally {
      setFeeLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-50 pb-20 p-4">
      <div className="bg-pink-500 text-white p-10 rounded-2xl shadow mb-6 text-center w-full">
        <p className="mt-2 text-lg">
          {user?.name ? <>Welcome back, {user.name} 👋</> : <span>&nbsp;</span>}
        </p>
        <p className="mt-3 text-sm opacity-90">
          Manage your payments method and booking fee
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <div className="bg-white rounded shadow p-4 mb-6">
          <h2 className="text-lg font-bold mb-4">Your Booking Fee</h2>
          {feeLoading ? (
            <p>Loading...</p>
          ) : feeError && user?.id ? (
            <p className="text-red-600 mb-2">Could not load booking fee.</p>
          ) : bookingFee === null && user?.id ? (
            <p className="text-gray-600 mb-2">No booking fee found.</p>
          ) : (
            <div className="flex items-center gap-4">
              {editingFee ? (
                <form
                  onSubmit={handleEditFeeSubmit}
                  className="flex items-center gap-2"
                >
                  <input
                    type="number"
                    value={editingBookingFee ?? ""}
                    onChange={(e) =>
                      setEditingBookingFee(Number(e.target.value))
                    }
                    className="border p-2 rounded"
                    placeholder="Booking Fee (%)"
                    required
                    min={0}
                  />
                  <button type="submit" className="text-green-600 font-bold">
                    Save
                  </button>
                  <button
                    type="button"
                    className="text-gray-500"
                    onClick={() => setEditingFee(false)}
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <>
                  <span className="font-semibold text-pink-700">
                    {bookingFee !== null
                      ? `${bookingFee}%`
                      : "No booking fee set."}
                  </span>
                  {bookingFee !== null && (
                    <button
                      className="text-blue-600 font-bold ml-2"
                      onClick={handleEditFee}
                    >
                      Edit
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {bookingFee === null && (
          <form
            onSubmit={handleBookingFeeSubmit}
            className="p-4 bg-white rounded shadow mb-6"
          >
            <label className="block mb-2 font-medium">
              Set Booking Fee (%)
            </label>
            <input
              type="number"
              value={newBookingFee ?? ""}
              onChange={(e) => setNewBookingFee(Number(e.target.value))}
              placeholder="e.g., 30"
              className="w-full border p-2 rounded mb-4"
              required
              min={0}
            />
            <button
              type="submit"
              className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
              disabled={feeLoading}
            >
              {feeLoading ? "Saving..." : "Save Booking Fee"}
            </button>
            {success && <p className="text-green-600 mt-2">{success}</p>}
            {feeError && <p className="text-red-600 mt-2">{feeError}</p>}
          </form>
        )}

        <div className="bg-white rounded shadow p-4 mt-6">
          <h2 className="text-lg font-bold mb-4">
            Payment Methods Linked to You
          </h2>
          {error && <p className="text-red-600 mb-2">{error}</p>}
          {methodsLoading ? (
            <p>Loading...</p>
          ) : stylistMethods.length === 0 ? (
            <p className="text-gray-500">No payment methods found for you.</p>
          ) : (
            <ul className="list-disc pl-5">
              {stylistMethods.map((pm: any, idx: number) => (
                <li key={pm.id || idx} className="mb-2 flex items-center gap-2">
                  {editingId === pm.id ? (
                    <form
                      onSubmit={handleEditSubmit}
                      className="flex flex-col gap-2 w-full"
                    >
                      <label className="text-xs font-medium text-gray-700">
                        Payment Name
                      </label>
                      <input
                        type="text"
                        value={editingMethodName}
                        onChange={(e) => setEditingMethodName(e.target.value)}
                        className="border p-2 rounded mb-2"
                        placeholder="Payment Name"
                        required
                      />
                      <label className="text-xs font-medium text-gray-700">
                        Account/Mobile Number
                      </label>
                      <input
                        type="text"
                        value={editingAccountNumber}
                        onChange={(e) =>
                          setEditingAccountNumber(e.target.value)
                        }
                        className="border p-2 rounded mb-2"
                        placeholder="Account/Mobile Number"
                        required
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          type="submit"
                          className="text-green-600 font-bold"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="text-gray-500"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <span className="font-semibold">
                        {pm.paymentName || "Unnamed Method"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {pm.accountNumber}
                      </span>
                      <button
                        className="text-blue-600 font-bold ml-2"
                        onClick={() => handleEdit(pm)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600 font-bold ml-2"
                        onClick={() => handleDelete(pm.id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-4 bg-white rounded shadow mb-6"
        >
          <label className="block mb-2 font-medium">Payment Method Name</label>
          <input
            type="text"
            value={paymentName}
            onChange={(e) => setMethodName(e.target.value)}
            placeholder="e.g., Mpesa, Orange Money"
            className="w-full border p-2 rounded mb-4"
            required
          />
          <label className="block mb-2 font-medium">
            Payment Account/Mobile Number
          </label>
          <input
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="Enter account number"
            className="w-full border p-2 rounded mb-4"
            required
          />
          <button
            type="submit"
            className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
            disabled={loading}
          >
            {loading ? "Saving..." : "Add Payment Method"}
          </button>
          {paymentSuccess && (
            <p className="text-green-600 mt-2">{paymentSuccess}</p>
          )}
          {error && <p className="text-red-600 mt-2">{error}</p>}
        </form>
      </div>
    </div>
  );
}
