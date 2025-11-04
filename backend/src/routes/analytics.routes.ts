import express from "express"
import { authMiddleware } from "../middleware/auth.middleware"
import { analyticsController } from "../controllers/analytics.controller"

const router = express.Router()

router.get("/dashboard", authMiddleware, analyticsController.getDashboardStats)
router.get("/incidents", authMiddleware, analyticsController.getIncidents)

export default router
