import cron from "node-cron"
import { checkerService } from "../services/checker.service"
import prisma from "../config/database"

export const startScheduler = () => {
  // Run monitor checks every minute
  cron.schedule("* * * * *", async () => {
    try {
      const monitors = await prisma.monitor.findMany({
        where: { status: "active" },
      })

      for (const monitor of monitors) {
        const result = await checkerService.checkEndpoint(monitor.url, monitor.method || "GET")

        // Store the check result
        await prisma.check.create({
          data: {
            monitorId: monitor.id,
            status: result.status,
            statusCode: result.statusCode,
            responseTime: result.responseTime,
            error: result.error,
          },
        })
      }

      console.log("[Scheduler] Monitor checks completed")
    } catch (error) {
      console.error("[Scheduler] Error:", error)
    }
  })
}
