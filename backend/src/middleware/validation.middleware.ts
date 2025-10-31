import type { Request, Response, NextFunction } from "express"
import { z, type ZodType } from "zod"

export const validate =
  (schema: ZodType) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.body)
      req.body = validated
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Validation failed",
          errors: error.issues,
        })
        return
      }
      next(error)
    }
  }
