import dotenv from "dotenv"

dotenv.config()

export const config = {
  // Server configuration
  PORT: process.env.PORT ? Number.parseInt(process.env.PORT) : 5000,
  NODE_ENV: process.env.NODE_ENV || "development",

  // Database configuration
  DATABASE_URL: process.env.DATABASE_URL || "",

  // Authentication
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key-change-in-production",
  JWT_EXPIRY: process.env.JWT_EXPIRY || "7d",

  // Redis for queue and caching
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",

  // Frontend URL for CORS and email verification
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",

  // Email configuration (SMTP)
  SMTP_HOST: process.env.SMTP_HOST || "",
  SMTP_PORT: Number.parseInt(process.env.SMTP_PORT || "587"),
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASS: process.env.SMTP_PASS || "",
  SMTP_FROM: process.env.SMTP_FROM || "noreply@pulsecheck.io",

  // Monitoring configuration
  MONITOR_CHECK_INTERVAL_MIN: Number.parseInt(process.env.MONITOR_CHECK_INTERVAL_MIN || "30"),
  MONITOR_MAX_TIMEOUT_MS: Number.parseInt(process.env.MONITOR_MAX_TIMEOUT_MS || "30000"),
  WORKER_CONCURRENCY: Number.parseInt(process.env.WORKER_CONCURRENCY || "10"),
  WORKER_RETRY_ATTEMPTS: Number.parseInt(process.env.WORKER_RETRY_ATTEMPTS || "3"),
  WORKER_RETRY_BACKOFF_MS: Number.parseInt(process.env.WORKER_RETRY_BACKOFF_MS || "1000"),

  // Alert thresholds
  INCIDENT_THRESHOLD_FAILURES: Number.parseInt(process.env.INCIDENT_THRESHOLD_FAILURES || "3"),
  INCIDENT_RECOVERY_COUNT: Number.parseInt(process.env.INCIDENT_RECOVERY_COUNT || "2"),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"),
  RATE_LIMIT_MAX_REQUESTS: Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),

  // Feature flags
  ENABLE_WEBSOCKETS: process.env.ENABLE_WEBSOCKETS !== "false",
  ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS !== "false",
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
}

// Validate required config in production
if (config.NODE_ENV === "production") {
  const requiredVars = ["DATABASE_URL", "JWT_SECRET", "REDIS_URL", "SMTP_HOST", "SMTP_USER"]

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      throw new Error(`Missing required environment variable: ${varName}`)
    }
  }
}
