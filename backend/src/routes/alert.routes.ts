import { Router,type Request,type Response } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { authController } from "../controllers/auth.controller";
import { alertController } from "../controllers/alert.controller";

const router = Router()
router.use(authMiddleware)

router.get("/",(req:Request,res:Response)=> alertController.getAlerts(req,res))

router.post("/",(req:Request,res:Response)=>alertController.createAlert(req,res))

router.put("/:id",(req:Request,res:Response)=>alertController.updateAlert(req,res))

router.delete("/:id",(req:Request,res:Response)=>alertController.deleteAlert(req,res))

export default router