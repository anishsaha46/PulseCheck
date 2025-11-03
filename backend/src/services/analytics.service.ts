
import prisma from "../config/database";

export const analyticsService={
  async getMonitorStats(monitorId: string, userId: string, rangeHours = 24) {
    const monitor = await prisma.monitor.findFirst({
      where: { id: monitorId, userId },
    })

    if (!monitor) throw new Error("Monitor not found")

    const since = new Date(Date.now() - rangeHours * 60 * 60 * 1000)

    const checks = await prisma.check.findMany({
      where: {
        monitorId,
        createdAt: { gte: since },
      },
      orderBy: { createdAt: "asc" },
    })

    if (checks.length === 0) {
      return {
        uptime: 0,
        avgLatency: 0,
        minLatency: 0,
        maxLatency: 0,
        p95Latency: 0,
        p99Latency: 0,
        errorRate: 0,
        checksCount: 0,
        distribution: {},
      }
    }

    const successfulChecks = checks.filter((c:any) => c.status === "up")
    const failedChecks = checks.filter((c:any) => c.status !== "up")

    const latencies = successfulChecks.map((c: any) => c.latencyMs).sort((a: number, b: number) => a - b)

    // Calculate percentiles
    const getPercentile = (arr: number[], p: number) => {
      const index = Math.ceil((arr.length * p) / 100) - 1
      return arr[Math.max(0, index)] || 0
    }

    // Latency distribution buckets: <50ms, 50-200ms, 200-500ms, >500ms
    const distribution = {
      under_50ms: checks.filter((c: any) => c.latencyMs < 50).length,
      "50_200ms": checks.filter((c:any) => c.latencyMs >= 50 && c.latencyMs < 200).length,
      "200_500ms": checks.filter((c:any) => c.latencyMs >= 200 && c.latencyMs < 500).length,
      over_500ms: checks.filter((c:any) => c.latencyMs >= 500).length,
    }

    return {
      uptime: (successfulChecks.length / checks.length) * 100,
      avgLatency: latencies.reduce((a: number, b: number) => a + b, 0) / latencies.length,
      minLatency: Math.min(...latencies),
      maxLatency: Math.max(...latencies),
      p95Latency: getPercentile(latencies, 95),
      p99Latency: getPercentile(latencies, 99),
      errorRate: (failedChecks.length / checks.length) * 100,
      checksCount: checks.length,
      distribution,
    }
  },

  
}