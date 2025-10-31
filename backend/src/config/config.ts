import dotenv from "dotenv"

dotenv.config()

export const config = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL || "",
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key",
  REDIS_URL: process.env.REDIS_URL || "",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  SMTP_HOST: process.env.SMTP_HOST || "",
  SMTP_PORT: Number.parseInt(process.env.SMTP_PORT || "587"),
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASS: process.env.SMTP_PASS || "",
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || "",
}
