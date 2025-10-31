import type {Request,Response,NextFunction} from "express"
interface ErrorWithStatus extends Error {
    status?:number
}
const errorMiddleware = (error:ErrorWithStatus,req:Request,res:Response,next:NextFunction):void=>{
    const status = error.status || 500
    const message = error.message || "Internal Server Error"
    console.error("[Error]",{status,message,stack:error.stack})
    res.status(status).json({
        error:{
            status,
            message,
            timestamp: new Date(),
        },
    })
}

export default errorMiddleware