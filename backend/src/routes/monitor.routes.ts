import { Router, type Request, type Response } from "express"
import { authMiddleware } from "../middleware/auth.middleware"
import { checkTriggerLimiter } from "../middleware/rateLimiter.middleware"
import { monitorController } from "../controllers/monitor.controller"

const router = Router()
router.use(authMiddleware)

router.get("/",(req:Request,res:Response)=>monitorController.getMonitors(req,res))

router.post("/",(req:Request,res:Response)=>monitorController.createMonitor(req,res))

router.get("/:id",(req:Request,res:Response)=>monitorController.getMonitor(req,res))

router.put("/:id", (req: Request, res: Response) => monitorController.updateMonitor(req, res))

router.delete("/:id", (req: Request, res: Response) => monitorController.deleteMonitor(req, res))

// Manual check trigger
router.post("/:id/check", checkTriggerLimiter, (req: Request, res: Response) => 
  monitorController.triggerCheck(req, res)
)

// Pause/Resume monitor
router.patch("/:id/pause", (req: Request, res: Response) => 
  monitorController.pauseMonitor(req, res)
)

router.patch("/:id/resume", (req: Request, res: Response) => 
  monitorController.resumeMonitor(req, res)
)

export default router
