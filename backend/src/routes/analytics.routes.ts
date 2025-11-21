import express from "express"
import { authMiddleware } from "../middleware/auth.middleware"
import { analyticsController } from "../controllers/analytics.controller"

const router = express.Router()

router.get("/dashboard", authMiddleware, analyticsController.getDashboardStats)
router.get("/incidents", authMiddleware, analyticsController.getIncidents)

// Monitor-specific analytics
router.get("/monitors/:id/timeseries", authMiddleware, analyticsController.getMonitorTimeSeries)
router.get("/monitors/:id/distribution", authMiddleware, analyticsController.getMonitorDistribution)
router.get("/monitors/:id/stats", authMiddleware, analyticsController.getMonitorStats)

export default router
