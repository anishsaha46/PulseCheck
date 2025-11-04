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

const defaultQueueOptions = {
  redis: config.REDIS_URL,
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

export const checkQueue = new Bull<CheckJobData>("api-checks", defaultQueueOptions)

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
