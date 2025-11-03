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
      where: { id, userId },
      include: { checks: true },
    })

    if (!monitor) {
      throw new Error("Monitor not found")
    }

    return monitor
  },

  async createMonitor(data: any, userId: string) {
    return await prisma.monitor.create({
      data: {
        ...data,
        userId,
        status: "active",
      },
    })
  },

  async updateMonitor(id: string, data: any, userId: string) {
    const monitor = await prisma.monitor.findFirst({
      where: { id, userId },
    })

    if (!monitor) {
      throw new Error("Monitor not found")
    }

    return await prisma.monitor.update({
      where: { id },
      data,
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
