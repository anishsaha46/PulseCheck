import express, { type Express, type Request, type Response } from "express"
import cors from "cors"
import dotenv from "dotenv"

import authRoutes from "./routes/auth.routes"
import monitorRoutes from "./routes/monitor.routes"
import checkRoutes from "./routes/check.routes"
import alertRoutes from "./routes/alert.routes"
import errorMiddleware from "./middleware/error.middleware"

dotenv.config()

const app: Express = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date() })
})

// API Routes
app.use("/api/auth", authRoutes)
app.use("/api/monitors", monitorRoutes)
app.use("/api/checks", checkRoutes)
app.use("/api/alerts", alertRoutes)

// Error handling
app.use(errorMiddleware)

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" })
})

export default app
