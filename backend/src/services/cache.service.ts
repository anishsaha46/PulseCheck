import redis from 'redis'
import { logger } from '../utils/logger'
import { config } from '../config/env'

let redisClient: any = null

export const initRedis = async () => {
  try {
    redisClient = redis.createClient({
      url: config.REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500),
      },
    })

    redisClient.on("error", (err: any) => logger.error("Redis error", err))
    redisClient.on("connect", () => logger.info("Redis connected"))

    await redisClient.connect()
    return redisClient
  } catch (error) {
    logger.error("Failed to initialize Redis", error)
    throw error
  }
}

export const cacheService={
    async get(key:string){
        try{
            if(!redisClient) return null
            const value= await redisClient.get(key)
            return value ? JSON.parse(value):null
        }catch(error){
            logger.error("Cache get Failed",{key,error})
            return null
        }
    }
}

