export const endpoints = {
  auth: {
    register: "/api/v1/auth/register",
    login: "/api/v1/auth/login",
    logout: "/api/v1/auth/logout",
    forgotPassword: "/api/v1/auth/forgot-password",
    profile: "/api/v1/auth/profile",
  },
  monitors: {
    list: "/api/v1/monitors",
    create: "/api/v1/monitors",
    get: (id: string) => `/api/v1/monitors/${id}`,
    update: (id: string) => `/api/v1/monitors/${id}`,
    delete: (id: string) => `/api/v1/monitors/${id}`,
    check: (id: string) => `/api/v1/monitors/${id}/check`,
    pause: (id: string) => `/api/v1/monitors/${id}/pause`,
    resume: (id: string) => `/api/v1/monitors/${id}/resume`,
  },
  checks: {
    list: (monitorId: string) => `/api/v1/checks?monitorId=${monitorId}`,
  },
  alerts: {
    list: "/api/v1/alerts",
    create: "/api/v1/alerts",
    delete: (id: string) => `/api/v1/alerts/${id}`,
  },
  analytics: {
    dashboard: "/api/v1/analytics/dashboard",
    incidents: "/api/v1/analytics/incidents",
    timeseries: (monitorId: string) => `/api/v1/analytics/monitors/${monitorId}/timeseries`,
    distribution: (monitorId: string) => `/api/v1/analytics/monitors/${monitorId}/distribution`,
  },
  subscription: "/api/v1/subscription",
}
