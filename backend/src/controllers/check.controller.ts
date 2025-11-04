import type { Response } from "express"
import type { AuthRequest } from "../middleware/auth.middleware"
import prisma from "../config/database"
import { successResponse, errorResponse } from "../utils/response"

export const checkController = {
  async getChecks(req: AuthRequest, res: Response) {
    try {
      const { monitorId } = req.params
      const skip = Number(req.query.skip) || 0
      const take = Math.min(Number(req.query.take) || 50, 1000)
      const status = req.query.status as string | undefined

      // Verify monitor ownership
      const monitor = await prisma.monitor.findFirst({
        where: { id: monitorId, userId: req.userId! },
      })

      if (!monitor) {
        return res.status(404).json(errorResponse("MONITOR_NOT_FOUND", "Monitor not found"))
      }

      const [checks, total] = await Promise.all([
        prisma.check.findMany({
          where: {
            monitorId,
            status: status ? status : undefined,
          },
          skip,
          take,
          orderBy: { createdAt: "desc" },
        }),
        prisma.check.count({
          where: {
            monitorId,
            status: status ? status : undefined,
          },
        }),
      ])

      res.json(
        successResponse({
          checks,
          pagination: { skip, take, total },
        }),
      )
    } catch (error: any) {
      res.status(500).json(errorResponse("CHECKS_FETCH_FAILED", error.message))
    }
  },

  async getCheck(req: AuthRequest, res: Response) {
    try {
      const { monitorId, checkId } = req.params

      const monitor = await prisma.monitor.findFirst({
        where: { id: monitorId, userId: req.userId! },
      })

      if (!monitor) {
        return res.status(404).json(errorResponse("MONITOR_NOT_FOUND", "Monitor not found"))
      }

      const check = await prisma.check.findFirst({
        where: { id: checkId, monitorId },
      })

      if (!check) {
        return res.status(404).json(errorResponse("CHECK_NOT_FOUND", "Check not found"))
      }

      res.json(successResponse(check))
    } catch (error: any) {
      res.status(500).json(errorResponse("CHECK_FETCH_FAILED", error.message))
    }
  },
}
