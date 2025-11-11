import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export const monitorSchema = z.object({
  name: z.string().min(1, "Monitor name is required"),
  url: z.string().url("Must be a valid URL"),
  method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]),
  intervalSec: z.number().min(10, "Interval must be at least 10 seconds"),
  timeoutMs: z.number().min(1000, "Timeout must be at least 1000ms"),
  headers: z.record(z.string(), z.string()).optional(),
  body: z.any().optional(),
  followRedirects: z.boolean().default(true),
  maxRedirects: z.number().min(1).max(10).default(5),
})

export const alertSchema = z.object({
  monitorId: z.string().min(1, "Monitor is required"),
  type: z.enum(["email", "webhook"]),
  channel: z.string().min(1, "Channel is required"),
  threshold: z.number().min(1, "Threshold must be at least 1"),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type MonitorInput = z.infer<typeof monitorSchema>
export type AlertInput = z.infer<typeof alertSchema>
