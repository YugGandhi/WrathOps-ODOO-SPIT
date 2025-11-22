import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface LoginData {
  loginId: string;
  password: string;
}

interface SignupData {
  loginId: string;
  password: string;
  email: string;
}

export function useLogin() {
  return useMutation({
    mutationFn: async (data: LoginData) => {
      return apiRequest("POST", "/api/auth/login", data);
    },
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: async (data: SignupData) => {
      return apiRequest("POST", "/api/auth/signup", data);
    },
  });
}
