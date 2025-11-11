import { create } from "zustand"

interface UIState {
  sidebarOpen: boolean
  theme: "light" | "dark"
  timeRange: "1h" | "6h" | "24h" | "7d" | "30d"
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: "light" | "dark") => void
  setTimeRange: (range: "1h" | "6h" | "24h" | "7d" | "30d") => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  theme: "light",
  timeRange: "24h",
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setTheme: (theme) => set({ theme }),
  setTimeRange: (timeRange) => set({ timeRange }),
}))
