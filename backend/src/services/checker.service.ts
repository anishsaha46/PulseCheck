import axios from "axios"
import { logger } from "../utils/logger"
import { config } from "../config/env"

interface CheckResult {
  statusCode: number | null
  latencyMs: number
  responseSizeBytes: number | null
  responseHeaders?: Record<string, string>
  status: "up" | "down" | "timeout" | "error"
  error?: string
}

export const checkerService = {
  async checkEndpoint(
    url: string,
    method = "GET",
    config_data?: {
      headers?: Record<string, string>
      body?: any
      timeoutMs?: number
      followRedirects?: boolean
      maxRedirects?: number
    },
  ): Promise<CheckResult> {
    const startTime = process.hrtime.bigint() // Use high-resolution timer for accuracy

    try {
      const response = await axios({
        url,
        method,
        timeout: config_data?.timeoutMs || 10000,
        headers: config_data?.headers,
        data: config_data?.body,
        maxRedirects: config_data?.maxRedirects || 5,
        validateStatus: () => true, // Accept any status code
      })

      const endTime = process.hrtime.bigint()
      const latencyMs = Number((endTime - startTime) / BigInt(1000000)) // Convert nanoseconds to milliseconds
      const isSuccess = response.status >= 200 && response.status < 400

      return {
        statusCode: response.status,
        latencyMs,
        responseSizeBytes: JSON.stringify(response.data).length,
        responseHeaders: this.extractHeaders(response.headers),
        status: isSuccess ? "up" : "down",
        error: isSuccess ? undefined : `HTTP ${response.status}`,
      }
    } catch (error) {
      const endTime = process.hrtime.bigint()
      const latencyMs = Number((endTime - startTime) / BigInt(1000000))

      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNABORTED") {
          return {
            statusCode: null,
            latencyMs,
            responseSizeBytes: null,
            status: "timeout",
            error: "Request timeout",
          }
        }

        if (error.code === "ECONNREFUSED") {
          return {
            statusCode: null,
            latencyMs,
            responseSizeBytes: null,
            status: "down",
            error: "Connection refused",
          }
        }

        if (error.code === "ENOTFOUND") {
          return {
            statusCode: null,
            latencyMs,
            responseSizeBytes: null,
            status: "down",
            error: "DNS resolution failed",
          }
        }
      }

      logger.error("Check error", error)

      return {
        statusCode: null,
        latencyMs,
        responseSizeBytes: null,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  },
}