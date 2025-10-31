import prisma from "../config/database"

export const monitorService = {
  async getMonitorsByUser(userId: string) {
    return await prisma.monitor.findMany({
      where: { userId },
      include: { checks: { take: 10, orderBy: { createdAt: "desc" } } },
    })
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
