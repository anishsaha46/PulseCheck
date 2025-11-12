import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"

export function useMonitors() {
  return useQuery({
    queryKey: ["monitors"],
    queryFn: () => apiClient.get(endpoints.monitors.list),
    staleTime: 30000,
  })
}

export function useMonitor(id: string) {
  return useQuery({
    queryKey: ["monitor", id],
    queryFn: () => apiClient.get(endpoints.monitors.get(id)),
    enabled: !!id,
  })
}

export function useCreateMonitor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => apiClient.post(endpoints.monitors.create, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monitors"] })
    },
  })
}

export function useUpdateMonitor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiClient.put(endpoints.monitors.update(id), data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["monitors"] })
      queryClient.invalidateQueries({ queryKey: ["monitor", variables.id] })
    },
  })
}

export function useDeleteMonitor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(endpoints.monitors.delete(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monitors"] })
    },
  })
}

export function useRunMonitorCheck() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiClient.post(endpoints.monitors.check(id), {}),
    onSuccess: (_, monitorId) => {
      queryClient.invalidateQueries({ queryKey: ["monitor", monitorId] })
      queryClient.invalidateQueries({ queryKey: ["monitors"] })
    },
  })
}

export function usePauseMonitor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiClient.post(endpoints.monitors.pause(id), {}),
    onSuccess: (_, monitorId) => {
      queryClient.invalidateQueries({ queryKey: ["monitors"] })
      queryClient.invalidateQueries({ queryKey: ["monitor", monitorId] })
    },
  })
}

export function useResumeMonitor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiClient.post(endpoints.monitors.resume(id), {}),
    onSuccess: (_, monitorId) => {
      queryClient.invalidateQueries({ queryKey: ["monitors"] })
      queryClient.invalidateQueries({ queryKey: ["monitor", monitorId] })
    },
  })
}
