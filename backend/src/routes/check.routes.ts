import { Router, type Request, type Response } from "express"
import { authMiddleware } from "../middleware/auth.middleware"
import { checkController } from "../controllers/check.controller"

const router = Router()

router.use(authMiddleware)

router.get("/monitor/:monitorId", (req: Request, res: Response) => checkController.getChecks(req, res))

router.get("/:checkId", (req: Request, res: Response) => checkController.getCheck(req, res))

export default router
