import TestSession from "../modules/testSession/testSession.model";

interface ActiveSession {
  socketId: string;
  testId: string;
  studentId: string;
  currentIndex: number;
  lastHeartbeat: Date;
}

class SessionManager {
  private sessions: Map<string, ActiveSession> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  addSession(socketId: string, testId: string, studentId: string, currentIndex: number) {
    this.sessions.set(socketId, {
      socketId,
      testId,
      studentId,
      currentIndex,
      lastHeartbeat: new Date(),
    });
  }

  removeSession(socketId: string) {
    this.sessions.delete(socketId);
  }

  getSession(socketId: string): ActiveSession | undefined {
    return this.sessions.get(socketId);
  }

  getStudentSession(studentId: string): ActiveSession | undefined {
    for (const session of this.sessions.values()) {
      if (session.studentId === studentId) return session;
    }
    return undefined;
  }

  getTestSession(testId: string): ActiveSession | undefined {
    for (const session of this.sessions.values()) {
      if (session.testId === testId) return session;
    }
    return undefined;
  }

  updateIndex(socketId: string, index: number) {
    const session = this.sessions.get(socketId);
    if (session) {
      session.currentIndex = index;
    }
  }

  updateHeartbeat(socketId: string) {
    const session = this.sessions.get(socketId);
    if (session) {
      session.lastHeartbeat = new Date();
    }
  }

  async handleDisconnect(socketId: string) {
    const session = this.sessions.get(socketId);
    if (!session) return;

    // Increment disconnect count and save last question index
    await TestSession.update(
      {
        disconnect_count: require("sequelize").literal("disconnect_count + 1"),
        last_question_index: session.currentIndex,
      },
      { where: { id: session.testId } }
    );

    this.sessions.delete(socketId);
  }

  startHeartbeatCheck(io: any, timeoutMs = 60000) {
    this.heartbeatInterval = setInterval(async () => {
      const now = new Date();
      for (const [socketId, session] of this.sessions.entries()) {
        const elapsed = now.getTime() - session.lastHeartbeat.getTime();
        if (elapsed > timeoutMs) {
          // Mark as abandoned
          await TestSession.update(
            { status: "abandoned" },
            { where: { id: session.testId, status: { [require("sequelize").Op.in]: ["pending", "in_progress"] } } }
          );

          const socket = io.sockets.sockets.get(socketId);
          if (socket) {
            socket.emit("error", { message: "Session timed out due to inactivity" });
            socket.disconnect();
          }

          this.sessions.delete(socketId);
        }
      }
    }, 30000);
  }

  stopHeartbeatCheck() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}

export const sessionManager = new SessionManager();
