import { z } from "zod"

export const createAlertSchema = z.object({
  monitorId: z.string(),
  type: z.enum(["email", "webhook"]),
  channel: z.string().refine((val) => {
    if (val.includes("@")) return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
    return val.startsWith("http://") || val.startsWith("https://")
  }, "Invalid email or webhook URL"),
  threshold: z.number().min(1).max(10).default(3),
  recoveryCount: z.number().min(1).max(10).default(2),
})
