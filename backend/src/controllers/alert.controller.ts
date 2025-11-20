import type { Response } from "express"
import type { AuthRequest } from "../middleware/auth.middleware"
import { alertService } from "../services/alert.service"
import { successResponse, errorResponse } from "../utils/response"

export const alertController = {
  async getAlerts(req: AuthRequest, res: Response) {
    try {
      const skip = Number(req.query.skip) || 0
      const take = Math.min(Number(req.query.take) || 20, 50)

      const alerts = await alertService.getAlerts(req.userId!, { skip, take })
      res.json(successResponse(alerts))
    } catch (error: any) {
      res.status(500).json(errorResponse("ALERTS_FETCH_FAILED", error.message))
    }
  },

  async createAlert(req: AuthRequest, res: Response) {
    try {
      const alert = await alertService.createAlert(req.userId!, req.body)
      res.status(201).json(successResponse(alert))
    } catch (error: any) {
      res.status(400).json(errorResponse("ALERT_CREATION_FAILED", error.message))
    }
  },

  async updateAlert(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      const alert = await alertService.updateAlert(id, req.userId!, req.body)
      res.json(successResponse(alert))
    } catch (error: any) {
      res.status(400).json(errorResponse("ALERT_UPDATE_FAILED", error.message))
    }
  },

  async deleteAlert(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      await alertService.deleteAlert(id, req.userId!)
      res.json(successResponse({ message: "Alert deleted" }))
    } catch (error: any) {
      res.status(400).json(errorResponse("ALERT_DELETE_FAILED", error.message))
    }
  },
}
