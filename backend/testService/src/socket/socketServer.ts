import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import winston from "winston";
import { env } from "../config/env";
import { registerSocketHandlers } from "./socketHandler";
import { sessionManager } from "./sessionManager";

interface DecodedToken {
  userId: string;
  email: string;
  role: string;
}

export function createSocketServer(httpServer: HttpServer, logger: winston.Logger): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Authentication middleware
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;

    if (!token || typeof token !== "string") {
      logger.warn("Socket auth failed: No token provided");
      return next(new Error("Authentication token required"));
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as DecodedToken;
      (socket as any).userId = decoded.userId;
      (socket as any).userEmail = decoded.email;
      (socket as any).userRole = decoded.role;
      next();
    } catch (error) {
      logger.warn("Socket auth failed: Invalid token");
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const userId = (socket as any).userId;
    logger.info("Socket connected", { socketId: socket.id, userId });

    registerSocketHandlers(socket, userId, logger);
  });

  // Start heartbeat checker
  sessionManager.startHeartbeatCheck(io);

  return io;
}
