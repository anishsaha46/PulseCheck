import type { Request, Response, NextFunction } from "express"
import type { AuthRequest } from "./auth.middleware"
import { logger } from "../utils/logger"
import { config } from "../config/env"

interface ErrorWithStatus extends Error {
  status?: number
  code?: string
}

const ERROR_CODES: Record<string, string> = {
  // Authentication errors (401)
  INVALID_TOKEN: "Invalid or expired authentication token",
  NO_TOKEN: "Authentication token required",
  INVALID_CREDENTIALS: "Invalid email or password",

  // Authorization errors (403)
  INSUFFICIENT_PERMISSIONS: "Insufficient permissions to perform this action",

  // Validation errors (400)
  INVALID_INPUT: "Invalid input data provided",
  MONITOR_INACTIVE: "Monitor is not active",
  QUOTA_EXCEEDED: "Plan limit exceeded. Please upgrade your plan.",
  RATE_LIMIT_EXCEEDED: "Too many requests. Please try again later.",
  VALIDATION_ERROR: "Please check your input and try again",

  // Not found errors (404)
  MONITOR_NOT_FOUND: "Monitor not found or access denied",
  ALERT_NOT_FOUND: "Alert not found or access denied",
  SUBSCRIPTION_NOT_FOUND: "Subscription not found",
  CHECK_NOT_FOUND: "Check not found",
  USER_NOT_FOUND: "User not found",

  // Server errors (500)
  INTERNAL_ERROR: "An unexpected error occurred",
  DATABASE_ERROR: "Database operation failed",
  CACHE_ERROR: "Cache operation failed",
  QUEUE_ERROR: "Queue operation failed",
  WEBSOCKET_ERROR: "WebSocket emission failed",

  // Operation errors (400)
  MONITOR_CREATION_FAILED: "Failed to create monitor",
  MONITOR_UPDATE_FAILED: "Failed to update monitor",
  MONITOR_DELETE_FAILED: "Failed to delete monitor",
  MONITOR_PAUSE_FAILED: "Failed to pause monitor",
  MONITOR_RESUME_FAILED: "Failed to resume monitor",
  CHECK_TRIGGER_FAILED: "Failed to trigger check",
  ALERT_CREATION_FAILED: "Failed to create alert",
  ALERT_UPDATE_FAILED: "Failed to update alert",
  ALERT_DELETE_FAILED: "Failed to delete alert",
  REGISTRATION_FAILED: "Registration failed",
  LOGIN_FAILED: "Login failed",
  PROFILE_UPDATE_FAILED: "Failed to update profile",
}

const errorMiddleware = (error: ErrorWithStatus, req: Request, res: Response, next: NextFunction): void => {
  const status = error.status || 500
  const code = error.code || "INTERNAL_ERROR"
  const message = ERROR_CODES[code] || error.message || "Internal Server Error"

  // Log with context
  logger.error("Request error", {
    status,
    code,
    message,
    path: req.path,
    method: req.method,
    userId: (req as AuthRequest).userId,
    stack: config.NODE_ENV === "development" ? error.stack : undefined,
  })

  // Send response
  res.status(status).json({
    success: false,
    error: {
      code,
      message,
      details: config.NODE_ENV === "development" ? error.stack : undefined,
    },
    meta: {
      timestamp: new Date(),
    },
  })
}

export default errorMiddleware
