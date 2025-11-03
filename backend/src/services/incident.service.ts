import prisma from "../config/database";
import { logger } from "../utils/logger";
import { config } from "../config/env";
import { alertService } from "./alert.service";

export const incidentService={
  async evaluateIncident(monitorId: string) {
    // Get recent checks
    const recentChecks = await prisma.check.findMany({
      where: { monitorId },
      orderBy: { createdAt: "desc" },
      take: Math.max(config.INCIDENT_THRESHOLD_FAILURES, config.INCIDENT_RECOVERY_COUNT) + 1,
    })

    if (recentChecks.length === 0) return

    const failureCount = recentChecks.filter((c:any) => c.status !== "up").length
    const successCount = recentChecks.filter((c:any) => c.status === "up").length

    // Check for open incidents
    const openIncident = await prisma.incident.findFirst({
      where: { monitorId, status: "open" },
    })

    // If consecutive failures >= threshold, create or reopen incident
    if (failureCount >= config.INCIDENT_THRESHOLD_FAILURES && !openIncident) {
      const incident = await prisma.incident.create({
        data: {
          monitorId,
          status: "open",
          failureCount,
          startAt: new Date(),
        },
      })

      logger.info("Incident created", { monitorId, incidentId: incident.id })

      // Trigger alerts
      await alertService.triggerAlerts(monitorId, "incident_created", incident)
    } else if (openIncident && successCount >= config.INCIDENT_RECOVERY_COUNT && failureCount === 0) {
      // Resolve incident
      const updated = await prisma.incident.update({
        where: { id: openIncident.id },
        data: {
          status: "resolved",
          endAt: new Date(),
          successCount,
        },
      })

      logger.info("Incident resolved", { monitorId, incidentId: openIncident.id })

      // Trigger recovery alerts
      await alertService.triggerAlerts(monitorId, "incident_resolved", updated)
    } else if (openIncident) {
      // Update incident counters
      await prisma.incident.update({
        where: { id: openIncident.id },
        data: { failureCount, successCount },
      })
    }
  },
}