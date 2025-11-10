// hooks/useAuth.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { register, login, RegisterData, LoginData } from "@/lib/api/auth";

export function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: register,
    onSuccess: (data) => {
      // Invalidate auth-related queries on successful registration
      qc.invalidateQueries({ queryKey: ["auth"] });
    },
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      // Invalidate auth-related queries on successful login
      qc.invalidateQueries({ queryKey: ["auth"] });
    },
  });
}
