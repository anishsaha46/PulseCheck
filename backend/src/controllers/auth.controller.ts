import type { Response } from "express"
import type { AuthRequest } from "../middleware/auth.middleware"
import { authService } from "../services/auth.service"
import { successResponse, errorResponse } from "../utils/response"
import { logger } from "../utils/logger"

export const authController = {
  async register(req: AuthRequest, res: Response) {
    try {
      const { email, password, name } = req.body
      const result = await authService.register({ email, password, name })
      res.status(201).json(successResponse(result))
    } catch (error: any) {
      logger.warn("Registration failed", { email: req.body.email, error: error.message })
      res.status(400).json(errorResponse("REGISTRATION_FAILED", error.message))
    }
  },

  async login(req: AuthRequest, res: Response) {
    try {
      const { email, password } = req.body
      const result = await authService.login({ email, password })
      res.json(successResponse(result))
    } catch (error: any) {
      logger.warn("Login failed", { email: req.body.email })
      res.status(401).json(errorResponse("LOGIN_FAILED", error.message))
    }
  },

  async getProfile(req: AuthRequest, res: Response) {
    try {
      const profile = await authService.getProfile(req.userId!)
      res.json(successResponse(profile))
    } catch (error: any) {
      res.status(404).json(errorResponse("PROFILE_NOT_FOUND", error.message))
    }
  },

  async updateProfile(req: AuthRequest, res: Response) {
    try {
      const { name, email } = req.body
      const updated = await authService.updateProfile(req.userId!, { name, email })
      res.json(successResponse(updated))
    } catch (error: any) {
      res.status(400).json(errorResponse("PROFILE_UPDATE_FAILED", error.message))
    }
  },

  async logout(req: AuthRequest, res: Response) {
    res.json(successResponse({ message: "Logged out successfully" }))
  },
}
