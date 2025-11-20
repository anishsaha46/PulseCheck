import Bull from "bull"
import { logger } from "../utils/logger"
import { config } from "../config/env"

export interface CheckJobData {
  monitorId: string
  url: string
  method: string
  headers?: Record<string, string>
  body?: any
  timeoutMs: number
  followRedirects: boolean
  maxRedirects: number
}

// Parse Redis URL for Bull configuration
const parseRedisUrl = (url: string) => {
  try {
    const urlObj = new URL(url)
    const isUpstash = url.includes('upstash.io')
    
    return {
      host: urlObj.hostname,
      port: parseInt(urlObj.port) || 6379,
      password: urlObj.password || undefined,
      username: urlObj.username || undefined,
      tls: isUpstash ? { rejectUnauthorized: false } : undefined,
    }
  } catch (error) {
    logger.error("Failed to parse Redis URL", error)
    return { host: 'localhost', port: 6379 }
  }
}

const defaultQueueOptions = {
  redis: parseRedisUrl(config.REDIS_URL || 'redis://localhost:6379'),
  defaultJobOptions: {
    attempts: config.WORKER_RETRY_ATTEMPTS,
    backoff: {
      type: "exponential",
      delay: config.WORKER_RETRY_BACKOFF_MS,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
  settings: {
    maxStalledCount: 2,
    lockDuration: 30000,
    lockRenewTime: 15000,
  },
}

let checkQueue: Bull.Queue<CheckJobData>

try {
  checkQueue = new Bull<CheckJobData>("api-checks", defaultQueueOptions)
} catch (error) {
  logger.error("Failed to initialize Bull queue", error)
  // Create a mock queue for development
  checkQueue = {
    process: () => {},
    add: async () => ({ id: 'mock' } as any),
    on: () => {},
  } as any
}

export { checkQueue }

checkQueue.on("error", (error) => {
  logger.error("Queue error", error)
})

checkQueue.on("failed", (job, error) => {
  logger.error("Job failed", { jobId: job.id, error: error.message })
})

checkQueue.on("completed", (job) => {
  logger.debug("Job completed", { jobId: job.id })
})

export const enqueueCheck = async (data: CheckJobData) => {
  try {
    const job = await checkQueue.add(data, {
      jobId: `${data.monitorId}-${Date.now()}`,
    })
    logger.debug("Check enqueued", { jobId: job.id, monitorId: data.monitorId })
    return job
  } catch (error) {
    logger.error("Failed to enqueue check", error)
    throw error
  }
}
