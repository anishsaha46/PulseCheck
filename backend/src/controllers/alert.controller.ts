import type { Response } from "express"
import type { AuthRequest } from "../middleware/auth.middleware"

export const alertController = {
  async getAlerts(req: AuthRequest, res: Response) {
    try {
      res.json({ alerts: [] })
    } catch (error: any) {
      res.status(500).json({ message: error.message })
    }
  },

  async createAlert(req: AuthRequest, res: Response) {
    try {
      res.status(201).json({ message: "Alert created" })
    } catch (error: any) {
      res.status(400).json({ message: error.message })
    }
  },

  async updateAlert(req: AuthRequest, res: Response) {
    try {
      res.json({ message: "Alert updated" })
    } catch (error: any) {
      res.status(400).json({ message: error.message })
    }
  },

  async deleteAlert(req: AuthRequest, res: Response) {
    try {
      res.json({ message: "Alert deleted" })
    } catch (error: any) {
      res.status(400).json({ message: error.message })
    }
  },
}
