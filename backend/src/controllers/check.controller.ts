import type { Response } from "express"
import type { AuthRequest } from "../middleware/auth.middleware"

export const checkController = {
  async getChecks(req: AuthRequest, res: Response) {
    try {
      const { monitorId } = req.params
      const { limit = "100", offset = "0" } = req.query

      res.json({
        checks: [],
        total: 0,
        limit: Number.parseInt(limit as string),
        offset: Number.parseInt(offset as string),
      })
    } catch (error: any) {
      res.status(500).json({ message: error.message })
    }
  },

  async getCheck(req: AuthRequest, res: Response) {
    try {
      const { checkId } = req.params
      res.json({
        id: checkId,
        status: "success",
        responseTime: 145,
        timestamp: new Date(),
      })
    } catch (error: any) {
      res.status(404).json({ message: error.message })
    }
  },
}
