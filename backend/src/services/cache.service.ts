import { createClient } from 'redis'
import { logger } from '../utils/logger'
import { config } from '../config/env'

let redisClient: any = null

export const initRedis = async () => {
  try {
    if (!config.REDIS_URL) {
      logger.warn("Redis URL not configured, running without cache")
      return null
    }

    // Check if using Upstash Redis (rediss:// protocol indicates TLS)
    const isUpstash = config.REDIS_URL.includes('upstash.io')
    const isTLS = config.REDIS_URL.startsWith('rediss://')
    
    const clientConfig: any = {
      url: config.REDIS_URL,
      socket: {
        reconnectStrategy: (retries: number) => Math.min(retries * 50, 500),
      },
    }

    // For TLS connections, disable strict certificate validation in development
    if (isTLS && config.NODE_ENV !== 'production') {
      clientConfig.socket.tls = true
      clientConfig.socket.rejectUnauthorized = false
    }

    if (isUpstash) {
      logger.info("Configuring Redis client for Upstash")
    }

    redisClient = createClient(clientConfig)

    redisClient.on("error", (err: any) => logger.error("Redis error", err))
    redisClient.on("connect", () => logger.info(`Redis connected ${isUpstash ? '(Upstash)' : '(Local)'}`))
    redisClient.on("ready", () => logger.info("Redis client ready"))

    await redisClient.connect()
    logger.info("Redis connection established successfully")
    return redisClient
  } catch (error) {
    logger.error("Failed to initialize Redis", error)
    logger.warn("Continuing without Redis cache")
    return null
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

    getMonitorStatsKey(monitorId: string, range: string) {
        return `monitor:${monitorId}:stats:${range}`
    },

    getMonitorListKey(userId: string) {
        return `user:${userId}:monitors`
    },

    getUserDashboardKey(userId: string) {
        return `user:${userId}:dashboard`
    },


}


