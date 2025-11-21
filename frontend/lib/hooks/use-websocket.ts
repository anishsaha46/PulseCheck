"use client"

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"

export function useWebSocketEvents() {
  const queryClient = useQueryClient()

  useEffect(() => {
    // WebSocket connection will be initialized in a separate service
    // This hook is for handling WebSocket events and cache invalidation
    // For now, we'll implement basic polling as fallback

    const handleTabVisibilityChange = () => {
      if (!document.hidden) {
        queryClient.invalidateQueries({ queryKey: ["monitors"] })
        queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] })
      }
    }

    document.addEventListener("visibilitychange", handleTabVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleTabVisibilityChange)
  }, [queryClient])
}
