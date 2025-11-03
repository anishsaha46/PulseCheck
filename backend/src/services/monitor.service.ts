import prisma from "../config/database"
import { logger } from "../utils/logger";
import { config } from "../config/env";

export const monitorService = {
  async validateUrl(url: string) {
    try {
      const urlObj = new URL(url)
      // Prevent monitoring of internal addresses in production
      if (config.NODE_ENV === "production") {
        const hostname = urlObj.hostname
        const isInternal =
          hostname === "localhost" ||
          hostname === "127.0.0.1" ||
          hostname.startsWith("192.168.") ||
          hostname.startsWith("10.") ||
          hostname.startsWith("172.")

        if (isInternal) {
          throw new Error("Cannot monitor internal IP addresses in production")
        }
      }
      return true
    } catch (error) {
      throw new Error("Invalid URL format")
    }
  },

  async checkSubscriptionLimits(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    })

    if (!user?.subscription) {
      throw new Error("User subscription not found")
    }

    const activeMonitors = await prisma.monitor.count({
      where: {
        userId,
        isActive: true,
        isDeleted: false,
      },
    })

    if (activeMonitors >= user.subscription.maxMonitors) {
      throw new Error(`Monitor limit reached (${user.subscription.maxMonitors}). Upgrade your plan.`)
    }

    return user.subscription
  },


  async getMonitorsByUser(userId: string, pagination = { skip: 0, take: 10 }) {
    const [monitors, total] = await Promise.all([
      prisma.monitor.findMany({
        where: { userId, isDeleted: false },
        include: {
          checks: { take: 5, orderBy: { createdAt: "desc" } },
          incidents: { where: { status: "open" }, take: 1 },
        },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.monitor.count({
        where: { userId, isDeleted: false },
      }),
    ])

    return {
      monitors,
      pagination: { skip: pagination.skip, take: pagination.take, total },
    }
  },

  async getMonitor(id: string, userId: string) {
    const monitor = await prisma.monitor.findFirst({
      where: { id, userId,isDeleted:false },
      include: {
        checks:{take:100,orderBy:{
          createdAt:"desc"
        }},
        incidents:{orderBy:{createdAt:"desc"},take:10},
        alerts:true,
      },
    })

    if (!monitor) {
      throw new Error("Monitor not found")
    }
    return monitor
  },

  async createMonitor(
    data: {
      name: string
      url: string
      method?: string
      intervalSec?: number
      timeoutMs?: number
      headers?: Record<string, string>
      body?: any
      followRedirects?: boolean
      maxRedirects?: number
    },
    userId: string,
  ) {
    // Validate URL
    await this.validateUrl(data.url)

    // Check subscription limits
    const subscription = await this.checkSubscriptionLimits(userId)

    // Validate interval is within plan limits
    const minInterval = Math.max(config.MONITOR_CHECK_INTERVAL_MIN, subscription.planName === "free" ? 60 : 30)

    if ((data.intervalSec || 60) < minInterval) {
      throw new Error(`Minimum check interval is ${minInterval} seconds for your plan`)
    }

    const monitor = await prisma.monitor.create({
      data: {
        userId,
        name: data.name,
        url: data.url,
        method: data.method || "GET",
        intervalSec: data.intervalSec || 60,
        timeoutMs: Math.min(data.timeoutMs || 10000, config.MONITOR_MAX_TIMEOUT_MS),
        headers: data.headers ? JSON.stringify(data.headers) : null,
        body: data.body ? JSON.stringify(data.body) : null,
        followRedirects: data.followRedirects !== false,
        maxRedirects: data.maxRedirects || 5,
        isActive: true,
      },
    })

    logger.info("Monitor created", { monitorId: monitor.id, userId })
    return monitor
  },

  async updateMonitor(id: string, data: Partial<Parameters<typeof this.createMonitor>[0]>, userId: string) {
    const monitor = await prisma.monitor.findFirst({
      where: { id, userId, isDeleted: false },
    })

    if (!monitor) {
      throw new Error("Monitor not found")
    }

    if (data.url) {
      await this.validateUrl(data.url)
    }

    const updateData: any = {}
    if (data.name) updateData.name = data.name
    if (data.url) updateData.url = data.url
    if (data.method) updateData.method = data.method
    if (data.intervalSec) updateData.intervalSec = data.intervalSec
    if (data.timeoutMs) updateData.timeoutMs = Math.min(data.timeoutMs, config.MONITOR_MAX_TIMEOUT_MS)
    if (data.headers) updateData.headers = JSON.stringify(data.headers)
    if (data.body) updateData.body = JSON.stringify(data.body)
    if (data.followRedirects !== undefined) updateData.followRedirects = data.followRedirects
    if (data.maxRedirects) updateData.maxRedirects = data.maxRedirects

    const updated = await prisma.monitor.update({
      where: { id },
      data: updateData,
    })

    logger.info("Monitor updated", { monitorId: id, userId })
    return updated
  },

  async pauseMonitor(id: string, userId: string) {
    const monitor = await prisma.monitor.findFirst({
      where: { id, userId, isDeleted: false },
    })

    if (!monitor) throw new Error("Monitor not found")

    return await prisma.monitor.update({
      where: { id },
      data: { isActive: false },
    })
  },

  async deleteMonitor(id: string, userId: string) {
    const monitor = await prisma.monitor.findFirst({
      where: { id, userId },
    })

    if (!monitor) {
      throw new Error("Monitor not found")
    }

    return await prisma.monitor.delete({ where: { id } })
  },
}
