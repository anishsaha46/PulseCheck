import type { Request, Response, NextFunction } from "express"
import { logger } from "../utils/logger"

interface ErrorWithStatus extends Error {
  status?: number
  code?: string
}

const errorMiddleware = (error: ErrorWithStatus, req: Request, res: Response, next: NextFunction): void => {
  const status = error.status || 500
  const code = error.code || "INTERNAL_ERROR"
  const message = error.message || "Internal Server Error"

  logger.error("Request error", {
    status,
    code,
    message,
    path: req.path,
    method: req.method,
    stack: error.stack,
  })

  res.status(status).json({
    success: false,
    error: {
      code,
      message,
      timestamp: new Date(),
    },
  })
}

export default errorMiddleware
