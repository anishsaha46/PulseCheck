import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"

export function useAlerts() {
  return useQuery({
    queryKey: ["alerts"],
    queryFn: () => apiClient.get(endpoints.alerts.list),
    staleTime: 30000,
  })
}

export function useCreateAlert() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => apiClient.post(endpoints.alerts.create, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] })
    },
  })
}

export function useDeleteAlert() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(endpoints.alerts.delete(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] })
    },
  })
}
