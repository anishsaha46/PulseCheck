import jwt from "jsonwebtoken"
import {config} from './env'

export const generateToken = (userId:string):string => {
    return jwt.sign({userId},config.JWT_SECRET,{expiresIn:"7d"})
}

export const verifyToken=(token:string):string | null => {
    try{
        const decoded = jwt.verify(token,config.JWT_SECRET) as {userId:string}
        return decoded.userId
    } catch{
        return null;
    }
}
