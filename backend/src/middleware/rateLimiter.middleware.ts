import rateLimit from "express-rate-limit"

export const apiLimiter = rateLimit({
    windowMs:15*60*1000,
    max:100,
    message:"Too many requests from this IP , please try again later",
})

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 minutes
  skipSuccessfulRequests: true, // Don't count successful logins
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many authentication attempts. Please try again later.",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
})

export const checkTriggerLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many check requests. Please try again later.",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
})
