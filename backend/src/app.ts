import express, { type Express, type Request, type Response } from "express"
import cors from "cors"
import dotenv from "dotenv"

import authRoutes from "./routes/auth.routes"
import monitorRoutes from "./routes/monitor.routes"
import checkRoutes from "./routes/check.routes"
import alertRoutes from "./routes/alert.routes"
import analyticsRoutes from "./routes/analytics.routes"
import errorMiddleware from "./middleware/error.middleware"
import { apiLimiter, authLimiter } from "./middleware/rateLimiter.middleware"
import { logger } from "./utils/logger"
import { config } from "./config/env"

dotenv.config()

const app: Express = express()

// Middleware
app.use(
  cors({
    origin: config.FRONTEND_URL,
    credentials: true,
  }),
)
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

app.use(apiLimiter)

// Logging middleware
app.use((req: Request, res: Response, next) => {
  logger.debug(`${req.method} ${req.path}`)
  next()
})

// Health check endpoint
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: "healthy",
      timestamp: new Date(),
      uptime: process.uptime(),
    },
  })
})

// API Routes (v1)
app.use("/api/v1/auth", authLimiter, authRoutes)
app.use("/api/v1/monitors", monitorRoutes)
app.use("/api/v1/checks", checkRoutes)
app.use("/api/v1/alerts", alertRoutes)
app.use("/api/v1/analytics", analyticsRoutes)

// 404 handler
app.use((req: Request, res: Response) => {
  logger.warn("Route not found", { path: req.path, method: req.method })
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "Route not found",
    },
  })
})

// Error handling middleware (must be last)
app.use(errorMiddleware)

export default app
