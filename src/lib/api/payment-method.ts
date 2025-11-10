/**
 * Payment Method API
 * Handles stylist payment method management
 */

import apiClient from "./client";

export async function savePaymentMethod(
  stylistId: string,
  methodName: string,
  accountNumber: string
) {
  if (typeof stylistId !== "string")
    throw new Error("stylistId must be a string");
  const res = await apiClient.post(`/stylist-payment-method`, {
    stylistId,
    methodName,
    accountNumber,
  });
  return res.data;
}

export async function fetchStylistPaymentMethods(stylistId: string) {
  if (typeof stylistId !== "string")
    throw new Error("stylistId must be a string");
  const res = await apiClient.get(`/stylist-payment-method/${stylistId}`);
  return res.data;
}

export async function EditPaymentMethod(
  id: string,
  methodName: string,
  accountNumber: string
) {
  if (typeof id !== "string") throw new Error("id must be a string");
  const res = await apiClient.put(`/stylist-payment-method/${id}`, {
    methodName,
    accountNumber,
  });
  return res.data;
}

export async function deletePaymentMethod(id: string) {
  if (typeof id !== "string") throw new Error("id must be a string");
  const res = await apiClient.delete(`/stylist-payment-method/${id}`);
  return res.data;
}
