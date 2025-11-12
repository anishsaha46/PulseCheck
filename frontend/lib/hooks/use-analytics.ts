import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"

export function useDashboardStats(timeRange = "24h") {
  return useQuery({
    queryKey: ["dashboard-stats", timeRange],
    queryFn: () => apiClient.get(endpoints.analytics.dashboard, { params: { timeRange } }),
    staleTime: 60000,
  })
}

export function useTimeSeriesData(monitorId: string, timeRange = "24h") {
  return useQuery({
    queryKey: ["timeseries", monitorId, timeRange],
    queryFn: () => apiClient.get(endpoints.analytics.timeseries(monitorId), { params: { timeRange } }),
    enabled: !!monitorId,
    staleTime: 30000,
  })
}

export function useDistributionData(monitorId: string, timeRange = "24h") {
  return useQuery({
    queryKey: ["distribution", monitorId, timeRange],
    queryFn: () => apiClient.get(endpoints.analytics.distribution(monitorId), { params: { timeRange } }),
    enabled: !!monitorId,
    staleTime: 30000,
  })
}

export function useIncidents(limit = 10) {
  return useQuery({
    queryKey: ["incidents", limit],
    queryFn: () => apiClient.get(endpoints.analytics.incidents, { params: { take: limit } }),
    staleTime: 30000,
  })
}
