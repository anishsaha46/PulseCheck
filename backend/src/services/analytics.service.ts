
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

    async getTimeSeriesData(monitorId: string, userId: string, rangeHours = 24, bucketMinutes = 5) {
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

    // Group checks into time buckets
    const bucketMs = bucketMinutes * 60 * 1000
    const buckets = new Map<number, typeof checks>()

    for (const check of checks) {
      const bucketTime = Math.floor(check.createdAt.getTime() / bucketMs) * bucketMs
      if (!buckets.has(bucketTime)) {
        buckets.set(bucketTime, [])
      }
      buckets.get(bucketTime)!.push(check)
    }

    // Calculate stats per bucket
    const timeSeries = Array.from(buckets.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([timestamp, bucketChecks]) => {
        const successCount = bucketChecks.filter((c: any) => c.status === "up").length
        const avgLatency =
          bucketChecks.filter((c: any) => c.status === "up").reduce((sum: number, c: any) => sum + c.latencyMs, 0) /
          Math.max(successCount, 1)

        return {
          timestamp: new Date(timestamp),
          avgLatency: Math.round(avgLatency),
          uptime: (successCount / bucketChecks.length) * 100,
          checksCount: bucketChecks.length,
        }
      })

    return timeSeries
  },

    async getUserDashboardStats(userId: string) {
    const monitors = await prisma.monitor.findMany({
      where: { userId, isDeleted: false },
    })

    const checks = await prisma.check.findMany({
      where: {
        monitor: { userId, isDeleted: false },
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    })

    const incidents = await prisma.incident.findMany({
      where: {
        monitor: { userId, isDeleted: false },
        status: "open",
      },
    })

    const successfulChecks = checks.filter((c:any) => c.status === "up").length
    const avgLatency = checks.length > 0 ? checks.reduce((sum:number, c:any) => sum + c.latencyMs, 0) / checks.length : 0

    return {
      monitorCount: monitors.length,
      activeIncidents: incidents.length,
      checksLast24h: checks.length,
      uptimeLast24h: checks.length > 0 ? (successfulChecks / checks.length) * 100 : 0,
      avgLatency: Math.round(avgLatency),
    }
  },

}