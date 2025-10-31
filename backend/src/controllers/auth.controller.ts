import type {Response} from "express"
import type { AuthRequest } from "../middleware/auth.middleware"
import { authService } from "../services/auth.service"

export const authController = {

    async register(req:AuthRequest,res:Response){
        try{
            const {email,password,name}=req.body
            const result = await authService.register({email,password,name})
            res.status(201).json(result)
        }catch(error:any){
            res.status(400).json({message:error.message})
        }
    },

    async login(req:AuthRequest,res:Response){
        try{
            const {email,password} = req.body;
            const result = await authService.login({email,password})
            res.json(result)
        }catch(error:any){
            res.status(401).json({message:error.message})
        }
    },

    async logout(req:AuthRequest,res:Response){
        res.json({message:"Logged out Successfully"})
    }
}