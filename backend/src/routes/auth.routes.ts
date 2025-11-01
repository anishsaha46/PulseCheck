import { Router, type Request, type Response } from "express"
import { authController } from "../controllers/auth.controller"
import { authLimiter } from "../middleware/rateLimiter.middleware"

const router = Router()

router.post("/register", authLimiter, (req: Request, res: Response) => authController.register(req, res))

router.post("/login", authLimiter, (req: Request, res: Response) => authController.login(req, res))

router.post("/logout", (req: Request, res: Response) => authController.logout(req, res))

export default router
