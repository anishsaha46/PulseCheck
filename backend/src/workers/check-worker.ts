import { checkQueue } from "./queue"
import { checkerService } from "../services/checker.service"
import { incidentService } from "../services/incident.service"
import prisma from "../config/database"
import { cacheService } from "../services/cache.service"
import { logger } from "../utils/logger"
import { config } from "../config/env"

export const startCheckWorker = async () => {
  logger.info("Starting check worker")

  checkQueue.process(config.WORKER_CONCURRENCY, async (job) => {
    const { monitorId, url, method, headers, body, timeoutMs, maxRedirects } = job.data

    try {
      logger.debug("Processing check job", { jobId: job.id, monitorId })

      // Execute check with retries
      const result = await checkerService.checkWithRetry(
        url,
        method,
        {
          headers,
          body,
          timeoutMs,
          maxRedirects,
        },
        config.WORKER_RETRY_ATTEMPTS,
      )

      // Store check result
      const check = await prisma.check.create({
        data: {
          monitorId,
          statusCode: result.statusCode,
          latencyMs: result.latencyMs,
          responseSizeBytes: result.responseSizeBytes,
          responseHeaders: result.responseHeaders ? JSON.stringify(result.responseHeaders) : null,
          status: result.status,
          error: result.error,
        },
      })

      logger.debug("Check stored", {
        checkId: check.id,
        monitorId,
        status: check.status,
        latency: check.latencyMs,
      })

      // Evaluate incidents
      await incidentService.evaluateIncident(monitorId)

      // Invalidate stats cache for this monitor
      await cacheService.invalidatePattern(`monitor:${monitorId}:stats:*`)

      return {
        success: true,
        checkId: check.id,
        status: check.status,
        latencyMs: check.latencyMs,
      }
    } catch (error) {
      logger.error("Check worker error", { jobId: job.id, error })
      throw error
    }
  })

  logger.info("Check worker started with concurrency:", config.WORKER_CONCURRENCY)
}
