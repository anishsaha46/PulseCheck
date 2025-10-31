import type { Response } from "express"
import type { AuthRequest } from "../middleware/auth.middleware"
import { monitorService } from "../services/monitor.service"

export const monitorController = {
  async getMonitors(req: AuthRequest, res: Response) {
    try {
      const monitors = await monitorService.getMonitorsByUser(req.userId!)
      res.json(monitors)
    } catch (error: any) {
      res.status(500).json({ message: error.message })
    }
  },

  async getMonitor(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      const monitor = await monitorService.getMonitor(id, req.userId!)
      res.json(monitor)
    } catch (error: any) {
      res.status(404).json({ message: error.message })
    }
  },

  async createMonitor(req: AuthRequest, res: Response) {
    try {
      const monitor = await monitorService.createMonitor(req.body, req.userId!)
      res.status(201).json(monitor)
    } catch (error: any) {
      res.status(400).json({ message: error.message })
    }
  },

  async updateMonitor(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      const monitor = await monitorService.updateMonitor(id, req.body, req.userId!)
      res.json(monitor)
    } catch (error: any) {
      res.status(400).json({ message: error.message })
    }
  },

  async deleteMonitor(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params
      await monitorService.deleteMonitor(id, req.userId!)
      res.json({ message: "Monitor deleted" })
    } catch (error: any) {
      res.status(400).json({ message: error.message })
    }
  },
}
