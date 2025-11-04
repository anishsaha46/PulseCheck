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
    },

    async set(key:string,value:any,ttlSeconds=300){
        try{
            if(!redisClient) return false
            await redisClient.setEx(key,ttlSeconds,JSON.stringify(value)
            )
            return true
        }catch(error){
            logger.warn("Cache set failed",{key,error})
            return false
        }
    },

    async delete(key: string) {
        try {
            if (!redisClient) return false
            await redisClient.del(key)
            return true
        } catch (error) {
            logger.warn("Cache delete failed", { key, error })
            return false
        }
    },

    async invalidatePattern(pattern:string){
        try{
            if(!redisClient) return false
            const keys= await redisClient.keys(pattern)
            if(keys.length >0){
                await redisClient.del(keys)
            }
            return true;
        }catch(error){
            logger.warn("Cache invalidate pattern failed",{pattern,error})
            return false
        }
    },

    
}


