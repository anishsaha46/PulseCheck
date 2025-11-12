import { useMutation } from "@tanstack/react-query"
import apiClient from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import { useAuthStore } from "@/lib/stores/auth-store"

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth)

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      apiClient.post(endpoints.auth.login, { email, password }),
    onSuccess: (data: any) => {
      setAuth(data.user, data.token)
    },
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: any) => apiClient.post(endpoints.auth.register, data),
  })
}

export function useLogout() {
  const clearAuth = useAuthStore((state) => state.clearAuth)

  return useMutation({
    mutationFn: () => apiClient.post(endpoints.auth.logout, {}),
    onSuccess: () => {
      clearAuth()
    },
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: ({ email }: { email: string }) => apiClient.post(endpoints.auth.forgotPassword, { email }),
  })
}
