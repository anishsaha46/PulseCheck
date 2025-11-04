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
}
