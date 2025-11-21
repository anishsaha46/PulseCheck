import { Router, type Request, type Response } from "express"
import { authMiddleware } from "../middleware/auth.middleware"
import { subscriptionController } from "../controllers/subscription.controller"

const router = Router()

router.get("/", authMiddleware, (req: Request, res: Response) =>
  subscriptionController.getSubscription(req, res)
)

export default router
