import prisma from "../config/database";
import { logger } from "../utils/logger";
import { config } from "../config/env";
import { alertService } from "./alert.service";
import { websocketService } from "./websocket.service";

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

      // Fetch monitor details for WebSocket emission
      const monitor = await prisma.monitor.findUnique({
        where: { id: monitorId },
        select: { id: true, name: true, url: true, userId: true },
      })

      // Emit WebSocket event
      if (monitor) {
        websocketService.emitIncidentCreated(monitor.userId, {
          incident,
          monitor: {
            id: monitor.id,
            name: monitor.name,
            url: monitor.url,
          },
        })
      }

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

      // Fetch monitor details for WebSocket emission
      const monitor = await prisma.monitor.findUnique({
        where: { id: monitorId },
        select: { id: true, name: true, url: true, userId: true },
      })

      // Emit WebSocket event
      if (monitor) {
        websocketService.emitIncidentResolved(monitor.userId, {
          incident: updated,
          monitor: {
            id: monitor.id,
            name: monitor.name,
            url: monitor.url,
          },
        })
      }

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

    async getIncidents(userId: string, pagination = { skip: 0, take: 20 }) {
    const incidents = await prisma.incident.findMany({
      where: {
        monitor: { userId, isDeleted: false },
      },
      include: { monitor: true },
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { createdAt: "desc" },
    })
    return incidents
  },

    async getMonitorIncidents(monitorId: string, userId: string) {
    const monitor = await prisma.monitor.findFirst({
      where: { id: monitorId, userId },
    })

    if (!monitor) throw new Error("Monitor not found")

    return await prisma.incident.findMany({
      where: { monitorId },
      orderBy: { createdAt: "desc" },
    })
  },

    async acknowledgeIncident(incidentId: string, userId: string) {
    const incident = await prisma.incident.findFirst({
      where: {
        id: incidentId,
        monitor: { userId },
      },
    })

    if (!incident) throw new Error("Incident not found")

    return await prisma.incident.update({
      where: { id: incidentId },
      data: { status: "acknowledged", acknowledgedAt: new Date() },
    })
  },

}