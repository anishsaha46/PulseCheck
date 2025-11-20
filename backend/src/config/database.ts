import { PrismaClient } from "../../generated/prisma"
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

export default prisma
