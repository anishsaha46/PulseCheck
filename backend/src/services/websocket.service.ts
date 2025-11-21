import { emitToUser } from "../websocket/server"
import { logger } from "../utils/logger"
import type { Check, Incident, Monitor } from "../../generated/prisma"

interface CheckCompletedEvent {
  monitorId: string
  check: Check
  monitor: {
    id: string
    name: string
    url: string
  }
}

interface IncidentCreatedEvent {
  incident: Incident
  monitor: {
    id: string
    name: string
    url: string
  }
}

interface IncidentResolvedEvent {
  incident: Incident
  monitor: {
    id: string
    name: string
    url: string
  }
}

interface MonitorUpdatedEvent {
  monitor: Monitor
}

export const websocketService = {
  emitCheckCompleted(userId: string, data: CheckCompletedEvent): void {
    try {
      emitToUser(userId, "check:completed", {
        monitorId: data.monitorId,
        monitor: data.monitor,
        check: {
          id: data.check.id,
          statusCode: data.check.statusCode,
          latencyMs: data.check.latencyMs,
          responseSizeBytes: data.check.responseSizeBytes,
          status: data.check.status,
          error: data.check.error,
          createdAt: data.check.createdAt.toISOString(),
        },
      })

      logger.debug("Check completed event emitted", {
        userId,
        monitorId: data.monitorId,
        checkId: data.check.id,
      })
    } catch (error) {
      logger.error("Failed to emit check completed event", {
        userId,
        monitorId: data.monitorId,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  },

  emitIncidentCreated(userId: string, data: IncidentCreatedEvent): void {
    try {
      emitToUser(userId, "incident:created", {
        incident: {
          id: data.incident.id,
          monitorId: data.incident.monitorId,
          status: data.incident.status,
          failureCount: data.incident.failureCount,
          startAt: data.incident.startAt.toISOString(),
        },
        monitor: data.monitor,
      })

      logger.info("Incident created event emitted", {
        userId,
        incidentId: data.incident.id,
        monitorId: data.incident.monitorId,
      })
    } catch (error) {
      logger.error("Failed to emit incident created event", {
        userId,
        incidentId: data.incident.id,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  },

  emitIncidentResolved(userId: string, data: IncidentResolvedEvent): void {
    try {
      const duration = data.incident.endAt
        ? data.incident.endAt.getTime() - data.incident.startAt.getTime()
        : 0

      emitToUser(userId, "incident:resolved", {
        incident: {
          id: data.incident.id,
          monitorId: data.incident.monitorId,
          status: data.incident.status,
          endAt: data.incident.endAt?.toISOString(),
          duration,
        },
        monitor: data.monitor,
      })

      logger.info("Incident resolved event emitted", {
        userId,
        incidentId: data.incident.id,
        monitorId: data.incident.monitorId,
        duration,
      })
    } catch (error) {
      logger.error("Failed to emit incident resolved event", {
        userId,
        incidentId: data.incident.id,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  },

  emitMonitorUpdated(userId: string, data: MonitorUpdatedEvent): void {
    try {
      emitToUser(userId, "monitor:updated", {
        monitor: {
          id: data.monitor.id,
          name: data.monitor.name,
          url: data.monitor.url,
          isActive: data.monitor.isActive,
          updatedAt: data.monitor.updatedAt.toISOString(),
        },
      })

      logger.debug("Monitor updated event emitted", {
        userId,
        monitorId: data.monitor.id,
      })
    } catch (error) {
      logger.error("Failed to emit monitor updated event", {
        userId,
        monitorId: data.monitor.id,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  },
}
