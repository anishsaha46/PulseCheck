import {Request,Response,NextFunction} from "express"
import {verifyToken} from "../config/auth"

export  interface AuthRequest extends Request {
    userId?:string
}

export const authMiddleware =(req:AuthRequest,res:Response,next:NextFunction):void=>{
    const token = req.headers.authorization?.split(" ")[1]
    if(!token){
        res.status(401).json({message:"No Token Provided"})
        return 
    }

    const userId= verifyToken(token)
    if(!userId){
        res.status(401).json({message:"Invalid Token"})
        return 
    }

    req.userId=userId
    next()
}