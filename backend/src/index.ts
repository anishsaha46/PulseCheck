import app from "./app"
import { config } from "./config/env"
import { startScheduler } from "./workers/schedular"
import { startCheckWorker } from "./workers/check-worker"
import { initRedis } from "./services/cache.service"
import prisma from "./config/database"
import { logger } from "./utils/logger"

const PORT = config.PORT || 5000

async function startServer() {
  try {
    logger.info("Starting API Latency Monitor Backend", {
      env: config.NODE_ENV,
      port: PORT,
    })

    // Initialize Redis connection
    logger.info("Initializing Redis connection...")
    await initRedis()

    // Start scheduler for monitoring
    logger.info("Starting scheduler...")
    startScheduler()

    // Start check worker
    logger.info("Starting check worker...")
    await startCheckWorker()

    // Start Express server
    app.listen(PORT, () => {
      logger.info("Server running", {
        url: `http://localhost:${PORT}`,
        apiHealth: `http://localhost:${PORT}/api/health`,
      })
    })

    // Graceful shutdown
    process.on("SIGTERM", async () => {
      logger.info("SIGTERM received, shutting down gracefully...")
      await prisma.$disconnect()
      process.exit(0)
    })

    process.on("SIGINT", async () => {
      logger.info("SIGINT received, shutting down gracefully...")
      await prisma.$disconnect()
      process.exit(0)
    })
  } catch (error) {
    logger.error("Server startup error", error)
    process.exit(1)
  }
}

startServer()
