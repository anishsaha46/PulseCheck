export interface User {
  id: string
  email: string
  name: string
  verified: boolean
  createdAt: string
}

export interface Monitor {
  id: string
  userId: string
  name: string
  url: string
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  headers?: Record<string, string>
  body?: any
  intervalSec: number
  timeoutMs: number
  followRedirects: boolean
  maxRedirects: number
  isActive: boolean
  lastCheckAt?: string
  lastStatus?: "up" | "down" | "timeout" | "error"
  createdAt: string
  updatedAt: string
}

export interface Check {
  id: string
  monitorId: string
  statusCode: number | null
  latencyMs: number
  responseSizeBytes: number | null
  status: "up" | "down" | "timeout" | "error"
  error: string | null
  startAt: string
  endAt: string
  createdAt: string
}

export interface Incident {
  id: string
  monitorId: string
  monitor?: Monitor
  status: "open" | "resolved" | "acknowledged"
  failureCount: number
  successCount: number
  startAt: string
  endAt: string | null
  acknowledgedAt: string | null
  rootCause: string | null
  createdAt: string
  updatedAt: string
}

export interface Alert {
  id: string
  userId: string
  monitorId: string
  type: "email" | "webhook"
  channel: string
  threshold: number
  createdAt: string
}

export interface Subscription {
  id: string
  userId: string
  planName: "free" | "pro" | "enterprise"
  maxMonitors: number
  maxAlerts: number
  retentionDays: number
  status: "active" | "canceled" | "expired"
  trialsRemaining: number
  createdAt: string
  expiresAt: string | null
}

export interface DashboardStats {
  totalMonitors: number
  activeMonitors: number
  totalChecks: number
  avgLatency: number
  uptime: number
  openIncidents: number
}

export interface TimeSeriesData {
  timestamp: string
  latency: number
  status: "up" | "down" | "timeout" | "error"
}

export interface DistributionData {
  bucket: string
  count: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: {
    code: string
    message: string
  }
}
