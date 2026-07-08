import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { registerSocketHandlers } from "./socketHandler";
import { sessionManager } from "./sessionManager";

interface DecodedToken {
  userId: string;
  email: string;
  role: string;
}

export function createSocketServer(httpServer: HttpServer): Server {
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
      return next(new Error("Authentication token required"));
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as DecodedToken;
      (socket as any).userId = decoded.userId;
      (socket as any).userEmail = decoded.email;
      (socket as any).userRole = decoded.role;
      next();
    } catch (error) {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const userId = (socket as any).userId;
    console.log(`Socket connected: ${socket.id} (user: ${userId})`);

    registerSocketHandlers(socket, userId);
  });

  // Start heartbeat checker
  sessionManager.startHeartbeatCheck(io);

  return io;
}
