import { z } from "zod"

export const createMonitorSchema = z.object({
  name: z.string().min(1, "Monitor name is required").max(100, "Monitor name too long"),
  url: z.string().url("Invalid URL"),
  method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD"]).default("GET"),
  intervalSec: z.number().min(30, "Minimum interval is 30 seconds").max(86400).default(60),
  timeoutMs: z.number().min(100, "Timeout must be at least 100ms").max(60000).default(10000),
  headers: z
    .record(z.string(), z.string())
    .refine((obj) => JSON.stringify(obj).length < 10000, {
      message: "Headers size exceeds 10KB limit",
    })
    .optional(),
  body: z
    .any()
    .refine((obj) => JSON.stringify(obj).length < 100000, {
      message: "Body size exceeds 100KB limit",
    })
    .optional(),
  followRedirects: z.boolean().default(true),
  maxRedirects: z.number().min(0).max(10).default(5),
})

export const updateMonitorSchema = createMonitorSchema.partial()
