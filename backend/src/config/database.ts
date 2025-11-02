import { PrismaClient } from "@prisma/client"
import { logger } from "../utils/logger"

let prisma: PrismaClient

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient({
    log: [
      { level: "error", emit: "event" },
      { level: "warn", emit: "event" },
    ],
  })
} else {
  const globalWithPrisma = global as typeof globalThis & {
    prisma: PrismaClient
  }
  if (!globalWithPrisma.prisma) {
    globalWithPrisma.prisma = new PrismaClient({
      log: ["error", "warn"],
    })
  }
  prisma = globalWithPrisma.prisma
}

// Log Prisma errors in production
prisma.$on("error", (e:Error) => {
  logger.error("Prisma error event", e)
})

export default prisma
