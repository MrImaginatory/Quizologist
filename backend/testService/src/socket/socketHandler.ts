import { Socket } from "socket.io";
import { sessionManager } from "./sessionManager";
import { TestSessionService } from "../modules/testSession/testSession.service";
import TestSession from "../modules/testSession/testSession.model";
import TestAnswer from "../modules/testAnswer/testAnswer.model";

interface JoinTestPayload {
  testId: string;
}

interface AnswerPayload {
  testId: string;
  questionIndex: number;
  questionId: string;
  answer: string;
  timeTaken: number;
}

interface SkipPayload {
  testId: string;
  questionIndex: number;
  questionId: string;
  timeTaken: number;
}

interface HeartbeatPayload {
  testId: string;
  questionIndex: number;
}

interface SubmitTestPayload {
  testId: string;
}

// Helper: Calculate time remaining in seconds
function getTimeRemaining(endsAt: Date | null): number {
  if (!endsAt) return -1;
  return Math.max(0, Math.floor((endsAt.getTime() - Date.now()) / 1000));
}

// Helper: Check if test has expired and auto-submit if needed
async function checkAndAutoSubmit(
  socket: Socket,
  session: any,
  studentId: string
): Promise<boolean> {
  if (!session.ends_at) return false;

  const timeRemaining = getTimeRemaining(new Date(session.ends_at));

  if (timeRemaining <= 0 && session.status === "in_progress") {
    try {
      const result = await TestSessionService.submit(session.id, studentId);
      sessionManager.removeSession(socket.id);
      socket.leave(`test:${session.id}`);
      socket.emit("test_submitted", {
        testId: session.id,
        result,
        reason: "timeout",
      });
      return true;
    } catch (error) {
      console.error("Auto-submit error:", error);
    }
  }

  return false;
}

export function registerSocketHandlers(socket: Socket, studentId: string) {
  socket.on("join_test", async (payload: JoinTestPayload) => {
    try {
      const { testId } = payload;

      // Check if student already has an active session
      const existingSession = sessionManager.getStudentSession(studentId);
      if (existingSession && existingSession.testId !== testId) {
        socket.emit("error", { message: "You already have an active test session" });
        return;
      }

      // Find test session
      const session = await TestSession.findOne({
        where: { id: testId, student_id: studentId },
      });

      if (!session) {
        socket.emit("error", { message: "Test session not found" });
        return;
      }

      if (session.status === "completed") {
        socket.emit("error", { message: "This test has already been completed" });
        return;
      }

      if (session.status === "abandoned") {
        socket.emit("error", { message: "This test has been abandoned" });
        return;
      }

      // Check if test has expired
      const timeRemaining = getTimeRemaining(session.ends_at);
      if (timeRemaining <= 0 && session.status === "in_progress") {
        // Auto-submit expired test
        await checkAndAutoSubmit(socket, session, studentId);
        return;
      }

      // Update status to in_progress
      if (session.status === "pending") {
        await session.update({ status: "in_progress" });
      }

      // Determine current index (resume from last position or start fresh)
      const currentIndex = session.last_question_index || 0;

      // Register session
      sessionManager.addSession(socket.id, testId, studentId, currentIndex);

      // Join the test room
      socket.join(`test:${testId}`);

      // Send test state to client
      socket.emit("test_joined", {
        testId,
        totalQuestions: session.total_questions,
        currentIndex,
        timeRemaining,
        endsAt: session.ends_at,
      });
    } catch (error) {
      console.error("join_test error:", error);
      socket.emit("error", { message: "Failed to join test" });
    }
  });

  socket.on("answer", async (payload: AnswerPayload) => {
    try {
      const { testId, questionIndex, questionId, answer, timeTaken } = payload;

      // Verify session exists and belongs to this student
      const session = await TestSession.findOne({
        where: { id: testId, student_id: studentId, status: "in_progress" },
      });

      if (!session) {
        socket.emit("error", { message: "Active test session not found" });
        return;
      }

      // Check if test has expired
      const expired = await checkAndAutoSubmit(socket, session, studentId);
      if (expired) return;

      // Find existing answer record
      const existingAnswer = await TestAnswer.findOne({
        where: { test_session_id: testId, question_id: questionId },
      });

      if (existingAnswer) {
        // Update existing answer
        await existingAnswer.update({
          selected_answer: answer,
          is_skipped: false,
          time_taken: timeTaken,
          submitted_at: new Date(),
        });
      } else {
        // Create new answer
        await TestAnswer.create({
          test_session_id: testId,
          question_id: questionId,
          selected_answer: answer,
          is_skipped: false,
          time_taken: timeTaken,
          submitted_at: new Date(),
        });
      }

      // Update session index
      sessionManager.updateIndex(socket.id, questionIndex + 1);

      // Calculate remaining time
      const timeRemaining = getTimeRemaining(session.ends_at);

      socket.emit("answer_recorded", {
        testId,
        questionIndex,
        success: true,
        timeRemaining,
      });
    } catch (error) {
      console.error("answer error:", error);
      socket.emit("error", { message: "Failed to record answer" });
    }
  });

  socket.on("skip", async (payload: SkipPayload) => {
    try {
      const { testId, questionIndex, questionId, timeTaken } = payload;

      const session = await TestSession.findOne({
        where: { id: testId, student_id: studentId, status: "in_progress" },
      });

      if (!session) {
        socket.emit("error", { message: "Active test session not found" });
        return;
      }

      // Check if test has expired
      const expired = await checkAndAutoSubmit(socket, session, studentId);
      if (expired) return;

      const existingAnswer = await TestAnswer.findOne({
        where: { test_session_id: testId, question_id: questionId },
      });

      if (existingAnswer) {
        await existingAnswer.update({
          selected_answer: null,
          is_skipped: true,
          time_taken: timeTaken,
          submitted_at: new Date(),
        });
      } else {
        await TestAnswer.create({
          test_session_id: testId,
          question_id: questionId,
          selected_answer: null,
          is_skipped: true,
          time_taken: timeTaken,
          submitted_at: new Date(),
        });
      }

      sessionManager.updateIndex(socket.id, questionIndex + 1);

      const timeRemaining = getTimeRemaining(session.ends_at);

      socket.emit("answer_recorded", {
        testId,
        questionIndex,
        success: true,
        timeRemaining,
      });
    } catch (error) {
      console.error("skip error:", error);
      socket.emit("error", { message: "Failed to skip question" });
    }
  });

  socket.on("heartbeat", async (payload: HeartbeatPayload) => {
    sessionManager.updateHeartbeat(socket.id);
    if (payload.questionIndex !== undefined) {
      sessionManager.updateIndex(socket.id, payload.questionIndex);
    }

    // Check if test has expired
    const session = await TestSession.findOne({
      where: { id: payload.testId, student_id: studentId, status: "in_progress" },
    });

    if (session) {
      const expired = await checkAndAutoSubmit(socket, session, studentId);
      if (!expired) {
        const timeRemaining = getTimeRemaining(session.ends_at);
        socket.emit("time_update", { timeRemaining });
      }
    }
  });

  socket.on("submit_test", async (payload: SubmitTestPayload) => {
    try {
      const { testId } = payload;

      const session = await TestSession.findOne({
        where: { id: testId, student_id: studentId, status: "in_progress" },
      });

      if (!session) {
        socket.emit("error", { message: "Active test session not found" });
        return;
      }

      const result = await TestSessionService.submit(testId, studentId);

      // Remove from active sessions
      sessionManager.removeSession(socket.id);

      // Leave the test room
      socket.leave(`test:${testId}`);

      socket.emit("test_submitted", { testId, result });
    } catch (error) {
      console.error("submit_test error:", error);
      socket.emit("error", { message: "Failed to submit test" });
    }
  });

  socket.on("disconnect", async () => {
    await sessionManager.handleDisconnect(socket.id);
  });
}
