import bcrypt from "bcryptjs"
import { generateToken } from "../config/auth"
import prisma from "../config/database"
import { logger } from "../utils/logger"
import { config } from "../config/env"


export const authService = {
  async register(data: { email: string; password: string; name: string }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      logger.warn("Registration attempt for existing email", { email: data.email })
      throw new Error("Email already registered")
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)

    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash: hashedPassword,
        verified: config.NODE_ENV !== "production", // Auto-verify in dev
        subscription: {
          create: {
            planName: "free",
            maxMonitors: 5,
            maxAlerts: 10,
            retentionDays: 7,
          },
        },
      },
      include: { subscription: true },
    })

    const token = generateToken(user.id)
    logger.info("User registered successfully", { userId: user.id, email: user.email })

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        verified: user.verified,
      },
      token,
    }
  },

    async login(data: { email: string; password: string }) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (!user) {
      logger.warn("Login attempt for non-existent user", { email: data.email })
      throw new Error("Invalid credentials")
    }

    const passwordMatch = await bcrypt.compare(data.password, user.passwordHash)

    if (!passwordMatch) {
      logger.warn("Failed login attempt", { userId: user.id })
      throw new Error("Invalid credentials")
    }

    const token = generateToken(user.id)
    logger.info("User logged in successfully", { userId: user.id })

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        verified: user.verified,
      },
      token,
    }
  },
}
