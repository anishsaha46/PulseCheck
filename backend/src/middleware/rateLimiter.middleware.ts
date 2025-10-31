import rateLimit from "express-rate-limit"

export const apiLimiter = rateLimit({
    windowMs:16*60*1000,
    max:100,
    message:"Too many requests from this IP , please try again later",
})

export const authLimiter = rateLimit({
    windowMs:15*60*1000,
    max:5,
    message:"Too many auth attempts,please try again later",
})