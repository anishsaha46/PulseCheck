import { Server } from "socket.io"
import { verifyToken } from "../config/auth"
import { config } from "../config/env"
import { logger } from "../utils/logger"

let io: Server | null = null

export function initializeWebSocket(httpServer: any): Server {
  if (io) {
    logger.warn("WebSocket server already initialized")
    return io
  }

  io = new Server(httpServer, {
    cors: {
      origin: config.FRONTEND_URL,
      credentials: true,
    },
    transports: ["websocket", "polling"],
  })

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token
    
    if (!token) {
      logger.warn("WebSocket connection attempt without token")
      return next(new Error("Authentication token required"))
    }

    const userId = verifyToken(token)
    
    if (!userId) {
      logger.warn("WebSocket connection attempt with invalid token")
      return next(new Error("Invalid authentication token"))
    }

    // Store userId in socket data
    socket.data.userId = userId
    next()
  })

  // Connection handler
  io.on("connection", (socket) => {
    const userId = socket.data.userId

    // Join user-specific room
    socket.join(`user:${userId}`)

    logger.info("WebSocket client connected", {
      socketId: socket.id,
      userId,
    })

    // Disconnection handler
    socket.on("disconnect", (reason) => {
      logger.info("WebSocket client disconnected", {
        socketId: socket.id,
        userId,
        reason,
      })
    })

    // Error handler
    socket.on("error", (error) => {
      logger.error("WebSocket error", {
        socketId: socket.id,
        userId,
        error: error.message,
      })
    })
  })

  logger.info("WebSocket server initialized", {
    cors: config.FRONTEND_URL,
  })

  return io
}

export function getIO(): Server | null {
  return io
}

export function emitToUser(userId: string, event: string, data: any): void {
  if (!io) {
    logger.error("WebSocket server not initialized")
    return
  }

  try {
    io.to(`user:${userId}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    })

    logger.debug("WebSocket event emitted", {
      userId,
      event,
    })
  } catch (error) {
    logger.error("Failed to emit WebSocket event", {
      userId,
      event,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
