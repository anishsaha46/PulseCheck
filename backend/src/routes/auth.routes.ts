import { Router, type Request, type Response } from "express"
import { authController } from "../controllers/auth.controller"
import { authLimiter } from "../middleware/rateLimiter.middleware"

import { authMiddleware } from "../middleware/auth.middleware"

const router = Router()

router.post("/register", authLimiter, (req: Request, res: Response) => authController.register(req, res))

router.post("/login", authLimiter, (req: Request, res: Response) => authController.login(req, res))

router.post("/logout", (req: Request, res: Response) => authController.logout(req, res))

// Profile routes
router.get("/profile", authMiddleware, (req: Request, res: Response) => authController.getProfile(req, res))

router.put("/profile", authMiddleware, (req: Request, res: Response) => authController.updateProfile(req, res))

export default router
