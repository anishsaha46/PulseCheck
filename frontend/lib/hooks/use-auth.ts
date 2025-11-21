import { useMutation } from "@tanstack/react-query"
import apiClient from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import { useAuthStore } from "@/lib/stores/auth-store"

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth)

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      apiClient.post(endpoints.auth.login, { email, password }),
    onSuccess: (response: any) => {
      // Backend returns { success: true, data: { user, token } }
      const { user, token } = response.data || response
      if (user && token) {
        setAuth(user, token)
      }
    },
  })
}

export function useRegister() {
  const setAuth = useAuthStore((state) => state.setAuth)

  return useMutation({
    mutationFn: (data: any) => apiClient.post(endpoints.auth.register, data),
    onSuccess: (response: any) => {
      // Backend returns { success: true, data: { user, token } }
      const { user, token } = response.data || response
      if (user && token) {
        setAuth(user, token)
      }
    },
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
