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

const getCurrentLogLevel = (): LogLevel => {
  const level = process.env.LOG_LEVEL?.toLowerCase() || "info"
  return LOG_LEVEL_MAP[level as keyof typeof LOG_LEVEL_MAP] || LogLevel.INFO
}

export const logger = {
  debug: (message: string, data?: any) => {
    if (getCurrentLogLevel() <= LogLevel.DEBUG) {
      console.log(JSON.stringify({ level: "DEBUG", message, data, timestamp: new Date() }))
    }
  },

  info: (message: string, data?: any) => {
    if (getCurrentLogLevel() <= LogLevel.INFO) {
      console.log(JSON.stringify({ level: "INFO", message, data, timestamp: new Date() }))
    }
  },

  warn: (message: string, data?: any) => {
    if (getCurrentLogLevel() <= LogLevel.WARN) {
      console.warn(JSON.stringify({ level: "WARN", message, data, timestamp: new Date() }))
    }
  },

  error: (message: string, error?: any) => {
    console.error(
      JSON.stringify({
        level: "ERROR",
        message,
        error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
        timestamp: new Date(),
      }),
    )
  },
}
