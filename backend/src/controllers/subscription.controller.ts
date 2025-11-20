import type { Response } from "express"
import type { AuthRequest } from "../middleware/auth.middleware"
import prisma from "../config/database"
import { successResponse, errorResponse } from "../utils/response"
import { logger } from "../utils/logger"

export const subscriptionController = {
  async getSubscription(req: AuthRequest, res: Response) {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { userId: req.userId! },
      })

      if (!subscription) {
        return res.status(404).json(
          errorResponse("SUBSCRIPTION_NOT_FOUND", "Subscription not found")
        )
      }

      // Calculate current usage
      const [monitorCount, alertCount] = await Promise.all([
        prisma.monitor.count({
          where: { userId: req.userId!, isDeleted: false },
        }),
        prisma.alert.count({
          where: { userId: req.userId! },
        }),
      ])

      res.json(
        successResponse({
          ...subscription,
          usage: {
            monitors: monitorCount,
            alerts: alertCount,
          },
        })
      )
    } catch (error: any) {
      logger.error("Subscription fetch failed", {
        userId: req.userId,
        error: error.message,
      })
      res.status(500).json(
        errorResponse("SUBSCRIPTION_FETCH_FAILED", error.message)
      )
    }
  },
}
