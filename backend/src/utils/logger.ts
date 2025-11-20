enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

const LOG_LEVEL_MAP = {
  debug: LogLevel.DEBUG,
  info: LogLevel.INFO,
  warn: LogLevel.WARN,
  error: LogLevel.ERROR,
}

const SENSITIVE_FIELDS = ["password", "passwordHash", "token", "email", "verificationToken", "passwordResetToken"]

const redactSensitive = (obj: any): any => {
  if (typeof obj !== "object" || obj === null) return obj

  if (Array.isArray(obj)) {
    return obj.map((item) => redactSensitive(item))
  }

  const redacted: any = {}
  for (const key in obj) {
    if (SENSITIVE_FIELDS.includes(key)) {
      redacted[key] = "[REDACTED]"
    } else if (typeof obj[key] === "object") {
      redacted[key] = redactSensitive(obj[key])
    } else {
      redacted[key] = obj[key]
    }
  }
  return redacted
}

const getCurrentLogLevel = (): LogLevel => {
  const level = process.env.LOG_LEVEL?.toLowerCase() || "info"
  return LOG_LEVEL_MAP[level as keyof typeof LOG_LEVEL_MAP] || LogLevel.INFO
}

export const logger = {
  debug: (message: string, data?: any) => {
    if (getCurrentLogLevel() <= LogLevel.DEBUG) {
      console.log(
        JSON.stringify({
          level: "DEBUG",
          message,
          data: redactSensitive(data),
          timestamp: new Date(),
        })
      )
    }
  },

  info: (message: string, data?: any) => {
    if (getCurrentLogLevel() <= LogLevel.INFO) {
      console.log(
        JSON.stringify({
          level: "INFO",
          message,
          data: redactSensitive(data),
          timestamp: new Date(),
        })
      )
    }
  },

  warn: (message: string, data?: any) => {
    if (getCurrentLogLevel() <= LogLevel.WARN) {
      console.warn(
        JSON.stringify({
          level: "WARN",
          message,
          data: redactSensitive(data),
          timestamp: new Date(),
        })
      )
    }
  },

  error: (message: string, error?: any) => {
    console.error(
      JSON.stringify({
        level: "ERROR",
        message,
        error: error instanceof Error ? { message: error.message, stack: error.stack } : redactSensitive(error),
        timestamp: new Date(),
      })
    )
  },
}
