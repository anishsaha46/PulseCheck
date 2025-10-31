import bcrypt from "bcryptjs"
import {generateToken} from "../config/auth";
import prisma from "../config/database";

export const authService= async(data:{email:string; password:string; name:string}) => {

    const existingUser = await prisma.user.findUnique({
        where:{email:data.email}
    })
    if(existingUser){
        throw new Error("User already exists")
    }
    const hashedPassword = await bcrypt.hash(data.password,10)
    const user = await prisma.user.create({
        data:{
            email:data.email,
            password:hashedPassword,
            name:data.name
        }
    })
    const token =generateToken(user.id)
    return{
        user:{id:user.id,email:user.email,name:user.email},token,
    }
}

