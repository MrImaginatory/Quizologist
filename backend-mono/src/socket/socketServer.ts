import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import winston from "winston";
import { JwtToken } from "../utils/jwtToken";
import { registerSocketHandlers } from "./socketHandler";
import { registerTimeBasedHandlers } from "./timeBasedSocketHandler";
import { sessionManager } from "./sessionManager";

export function createSocketServer(httpServer: HttpServer, logger: winston.Logger): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware
  io.use((socket: Socket, next) => {
    const rawToken = socket.handshake.auth?.token || socket.handshake.query?.token;

    if (!rawToken || typeof rawToken !== "string") {
      logger.warn("Socket auth failed: No token provided");
      return next(new Error("Authentication token required"));
    }

    const token = rawToken.startsWith("Bearer ") ? rawToken.slice(7) : rawToken;

    try {
      const decoded = JwtToken.verify(token);
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
    registerTimeBasedHandlers(socket, userId, logger);
  });

  // Start heartbeat checker
  sessionManager.startHeartbeatCheck(io);

  return io;
}
