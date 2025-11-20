import type { Response } from "express"
import type { AuthRequest } from "../middleware/auth.middleware"
import { monitorService } from "../services/monitor.service"
import { cacheService } from "../services/cache.service"
import { analyticsService } from "../services/analytics.service"
import { successResponse,errorResponse } from "../utils/response"
import { logger } from "../utils/logger"
import { enqueueCheck } from "../workers/queue"


export const monitorController = {
  async getMonitors(req: AuthRequest, res: Response) {
    try {
      const skip = Number(req.query.skip) || 0;
      const take=Math.min(Number(req.query.take) || 10,50)
      const result = await monitorService.getMonitorsByUser(req.userId!,{skip,take})
      res.json(successResponse(result))
    } catch (error: any) {
      res.status(500).json(errorResponse("FETCH_MONITORS_FAILED",error.message))
    }
  },

  async getMonitor(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      const monitor = await monitorService.getMonitor(id, req.userId!)
      res.json(successResponse(monitor))
    } catch (error: any) {
      res.status(404).json(errorResponse("MONITOR_NOT_FOUND",error.message))
    }
  },

  async createMonitor(req: AuthRequest, res: Response) {
    try {
      const monitor = await monitorService.createMonitor(req.body, req.userId!)
      logger.info("Monitor created via API", { monitorId: monitor.id })
      res.status(201).json(successResponse(monitor))
    } catch (error: any) {
      logger.warn("Monitor creation failed", { error: error.message })
      res.status(400).json(errorResponse("MONITOR_CREATION_FAILED", error.message))
    }
  },

  async updateMonitor(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      const monitor = await monitorService.updateMonitor(id, req.body, req.userId!)

      // Invalidate cache
      await cacheService.invalidatePattern(`monitor:${id}:*`)

      res.json(successResponse(monitor))
    } catch (error: any) {
      res.status(400).json(errorResponse("MONITOR_UPDATE_FAILED", error.message))
    }
  },

  async pauseMonitor(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      const monitor = await monitorService.pauseMonitor(id, req.userId!)
      await cacheService.invalidatePattern(`monitor:${id}:*`)
      res.json(successResponse(monitor))
    } catch (error: any) {
      res.status(400).json(errorResponse("MONITOR_PAUSE_FAILED", error.message))
    }
  },

  async resumeMonitor(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      const monitor = await monitorService.resumeMonitor(id, req.userId!)
      await cacheService.invalidatePattern(`monitor:${id}:*`)
      res.json(successResponse(monitor))
    } catch (error: any) {
      res.status(400).json(errorResponse("MONITOR_RESUME_FAILED", error.message))
    }
  },

  async deleteMonitor(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      const permanent = req.query.permanent === "true"

      if (permanent) {
        await monitorService.hardDeleteMonitor(id, req.userId!)
      } else {
        await monitorService.softDeleteMonitor(id, req.userId!)
      }

      await cacheService.invalidatePattern(`monitor:${id}:*`)
      res.json(successResponse({ message: "Monitor deleted" }))
    } catch (error: any) {
      res.status(400).json(errorResponse("MONITOR_DELETE_FAILED", error.message))
    }
  },

  async triggerCheck(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params

      // Fetch monitor and verify ownership
      const monitor = await monitorService.getMonitor(id, req.userId!)

      // Check if monitor is active
      if (!monitor.isActive) {
        return res.status(400).json(errorResponse("MONITOR_INACTIVE", "Monitor is not active"))
      }

      // Parse headers and body from JSON
      const headers = monitor.headers ? JSON.parse(monitor.headers as string) : undefined
      const body = monitor.body ? JSON.parse(monitor.body as string) : undefined

      // Enqueue immediate check
      await enqueueCheck({
        monitorId: monitor.id,
        url: monitor.url,
        method: monitor.method,
        headers,
        body,
        timeoutMs: monitor.timeoutMs,
        followRedirects: monitor.followRedirects,
        maxRedirects: monitor.maxRedirects,
      })

      logger.info("Manual check triggered", {
        monitorId: monitor.id,
        userId: req.userId,
      })

      res.json(successResponse({
        message: "Check triggered successfully",
        monitorId: monitor.id,
      }))
    } catch (error: any) {
      logger.error("Manual check trigger failed", {
        monitorId: req.params.id,
        userId: req.userId,
        error: error.message,
      })
      res.status(400).json(errorResponse("CHECK_TRIGGER_FAILED", error.message))
    }
  },
}
