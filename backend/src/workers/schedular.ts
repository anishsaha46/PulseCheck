import cron from "node-cron"
import prisma from "../config/database"
import { logger } from "../utils/logger"
import { enqueueCheck } from "./queue"

export const startScheduler = () => {
  logger.info("Starting scheduler")

  // Run every minute to check which monitors are due for a check
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date()

      // Get all active monitors
      const monitors = await prisma.monitor.findMany({
        where: { isActive: true, isDeleted: false },
      })

      if (monitors.length === 0) {
        return
      }

      let enqueuedCount = 0

      // Process monitors in batches
      for (const monitor of monitors) {
        // Check if monitor is due for a check based on its interval
        const lastCheck = await prisma.check.findFirst({
          where: { monitorId: monitor.id },
          orderBy: { createdAt: "desc" },
          select: { createdAt: true },
        })

        if (!lastCheck) {
          // Never checked before, enqueue immediately
          await enqueueCheck({
            monitorId: monitor.id,
            url: monitor.url,
            method: monitor.method,
            headers: monitor.headers ? JSON.parse(monitor.headers) : undefined,
            body: monitor.body ? JSON.parse(monitor.body) : undefined,
            timeoutMs: monitor.timeoutMs,
            followRedirects: monitor.followRedirects,
            maxRedirects: monitor.maxRedirects,
          })
          enqueuedCount++
        } else {
          // Check if enough time has passed since last check
          const secondsSinceLastCheck = (now.getTime() - lastCheck.createdAt.getTime()) / 1000
          if (secondsSinceLastCheck >= monitor.intervalSec) {
            await enqueueCheck({
              monitorId: monitor.id,
              url: monitor.url,
              method: monitor.method,
              headers: monitor.headers ? JSON.parse(monitor.headers) : undefined,
              body: monitor.body ? JSON.parse(monitor.body) : undefined,
              timeoutMs: monitor.timeoutMs,
              followRedirects: monitor.followRedirects,
              maxRedirects: monitor.maxRedirects,
            })
            enqueuedCount++
          }
        }
      }

      if (enqueuedCount > 0) {
        logger.debug("Scheduler enqueued checks", {
          total: monitors.length,
          enqueued: enqueuedCount,
        })
      }
    } catch (error) {
      logger.error("Scheduler error", error)
    }
  })

  logger.info("Scheduler started (runs every minute)")
}
