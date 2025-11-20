import type { Response } from "express"
import type { AuthRequest } from "../middleware/auth.middleware"
import { analyticsService } from "../services/analytics.service"
import { incidentService } from "../services/incident.service"
import { cacheService } from "../services/cache.service"
import { successResponse, errorResponse } from "../utils/response"

export const analyticsController = {
  async getDashboardStats(req: AuthRequest, res: Response) {
    try {
      const cacheKey = cacheService.getUserDashboardKey(req.userId!)
      let stats = await cacheService.get(cacheKey)

      if (!stats) {
        stats = await analyticsService.getUserDashboardStats(req.userId!)
        await cacheService.set(cacheKey, stats, 300)
      }

      res.json(successResponse(stats))
    } catch (error: any) {
      res.status(500).json(errorResponse("DASHBOARD_STATS_FAILED", error.message))
    }
  },

  async getIncidents(req: AuthRequest, res: Response) {
    try {
      const skip = Number(req.query.skip) || 0
      const take = Math.min(Number(req.query.take) || 20, 50)

      const incidents = await incidentService.getIncidents(req.userId!, {
        skip,
        take,
      })

      res.json(successResponse(incidents))
    } catch (error: any) {
      res.status(500).json(errorResponse("INCIDENTS_FETCH_FAILED", error.message))
    }
  },

  async getMonitorTimeSeries(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      const rangeHours = Number(req.query.rangeHours) || 24
      const bucketMinutes = Number(req.query.bucketMinutes) || 5

      const data = await analyticsService.getTimeSeriesData(
        id,
        req.userId!,
        rangeHours,
        bucketMinutes
      )

      res.json(successResponse(data))
    } catch (error: any) {
      res.status(500).json(errorResponse("TIMESERIES_FETCH_FAILED", error.message))
    }
  },

  async getMonitorDistribution(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      const rangeHours = Number(req.query.rangeHours) || 24

      const stats = await analyticsService.getMonitorStats(id, req.userId!, rangeHours)
      res.json(successResponse(stats.distribution))
    } catch (error: any) {
      res.status(500).json(errorResponse("DISTRIBUTION_FETCH_FAILED", error.message))
    }
  },

  async getMonitorStats(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      const rangeHours = Number(req.query.rangeHours) || 24

      const cacheKey = cacheService.getMonitorStatsKey(id, `${rangeHours}h`)
      let stats = await cacheService.get(cacheKey)

      if (!stats) {
        stats = await analyticsService.getMonitorStats(id, req.userId!, rangeHours)
        await cacheService.set(cacheKey, stats, 60)
      }

      res.json(successResponse(stats))
    } catch (error: any) {
      res.status(500).json(errorResponse("STATS_FETCH_FAILED", error.message))
    }
  },
}
