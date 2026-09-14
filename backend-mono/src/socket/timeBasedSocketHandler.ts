import { Socket } from "socket.io";
import winston from "winston";
import { sessionManager } from "./sessionManager";
import { TimeBasedService } from "../modules/timeBased/timeBased.service";
import TestSession from "../modules/testSession/testSession.model";
import TestAnswer from "../modules/testAnswer/testAnswer.model";
import Question from "../modules/question/question.model";

interface TbJoinPayload {
  testId: string;
}

interface TbAnswerPayload {
  testId: string;
  questionId: string;
  answer: string;
  timeTaken: number;
}

interface TbSkipPayload {
  testId: string;
  questionId: string;
  timeTaken: number;
}

interface TbHeartbeatPayload {
  testId: string;
}

interface TbSubmitPayload {
  testId: string;
}

// Helper: Calculate time remaining in seconds
function getTimeRemaining(endsAt: Date | null): number {
  if (!endsAt) return -1;
  return Math.max(0, Math.floor((endsAt.getTime() - Date.now()) / 1000));
}

// Helper: Check if test has expired and auto-submit if needed
async function checkAndAutoSubmitTb(
  socket: Socket,
  session: any,
  studentId: string,
  logger: winston.Logger
): Promise<boolean> {
  if (!session.ends_at) return false;

  const timeRemaining = getTimeRemaining(new Date(session.ends_at));

  if (timeRemaining <= 0 && session.status === "in_progress") {
    try {
      const result = await TimeBasedService.submit(session.id, studentId);
      sessionManager.removeSession(socket.id);
      socket.leave(`tb_test:${session.id}`);
      socket.emit("tb:test_submitted", {
        testId: session.id,
        result,
        reason: "timeout",
      });
      return true;
    } catch (error: any) {
      logger.error("TB Auto-submit error", { error: error.message, stack: error.stack });
    }
  }

  return false;
}

export function registerTimeBasedHandlers(socket: Socket, studentId: string, logger: winston.Logger) {
  socket.on("tb:join", async (payload: TbJoinPayload) => {
    try {
      const { testId } = payload;

      const existingSession = sessionManager.getStudentSession(studentId);
      if (existingSession && existingSession.testId !== testId) {
        socket.emit("tb:error", { message: "You already have an active test session" });
        return;
      }

      const session = await TestSession.findOne({
        where: { id: testId, student_id: studentId, test_type: "time_based" },
      });

      if (!session) {
        socket.emit("tb:error", { message: "Time-based test session not found" });
        return;
      }

      if (session.status === "completed" || session.status === "abandoned") {
        socket.emit("tb:error", { message: "This test has already been completed or abandoned" });
        return;
      }

      if (await checkAndAutoSubmitTb(socket, session, studentId, logger)) {
        return;
      }

      socket.join(`tb_test:${testId}`);
      sessionManager.addSession(socket.id, testId, studentId, 0);

      socket.emit("tb:test_joined", {
        testId,
        timeRemaining: getTimeRemaining(session.ends_at),
        status: session.status,
      });

      // Fetch or generate the current active question
      const activeAnswer = await TestAnswer.findOne({
        where: {
          test_session_id: testId,
          selected_answer: null,
          is_skipped: false,
        },
      });

      let nextQData = null;
      if (activeAnswer) {
        const question = await Question.findByPk(activeAnswer.question_id);
        if (question) {
          nextQData = { allCorrect: false, question: { ...question.toJSON() } };
        }
      }

      if (!nextQData) {
        nextQData = await TimeBasedService.getNextQuestion(testId, studentId, null, null);
      }

      if (nextQData.allCorrect) {
        socket.emit("tb:all_correct", { testId });
      } else {
        socket.emit("tb:next_question", {
          testId,
          question: nextQData.question,
        });
      }
    } catch (error: any) {
      logger.error("tb:join error", { error: error.message, stack: error.stack });
      socket.emit("tb:error", { message: "Failed to join time-based test" });
    }
  });

  socket.on("tb:answer", async (payload: TbAnswerPayload) => {
    try {
      const { testId, questionId, answer, timeTaken } = payload;

      const session = await TestSession.findOne({
        where: { id: testId, student_id: studentId, test_type: "time_based" },
      });

      if (!session || session.status !== "in_progress") {
        socket.emit("tb:error", { message: "Test not active" });
        return;
      }

      if (await checkAndAutoSubmitTb(socket, session, studentId, logger)) return;

      const question = await Question.findByPk(questionId);
      if (!question) {
        socket.emit("tb:error", { message: "Question not found" });
        return;
      }

      const isCorrect = question.correctAnswer === answer;

      // Update the stub TestAnswer
      await TestAnswer.update(
        {
          selected_answer: answer,
          is_correct: isCorrect,
          time_taken: timeTaken,
        },
        {
          where: {
            test_session_id: testId,
            question_id: questionId,
            selected_answer: null, // Only update if not answered
          },
        }
      );

      const nextQData = await TimeBasedService.getNextQuestion(testId, studentId, questionId, isCorrect);

      if (nextQData.allCorrect) {
        socket.emit("tb:all_correct", { testId });
      } else {
        socket.emit("tb:next_question", {
          testId,
          question: nextQData.question,
        });
      }
    } catch (error: any) {
      logger.error("tb:answer error", { error: error.message, stack: error.stack });
      socket.emit("tb:error", { message: "Failed to submit answer" });
    }
  });

  socket.on("tb:skip", async (payload: TbSkipPayload) => {
    try {
      const { testId, questionId, timeTaken } = payload;

      const session = await TestSession.findOne({
        where: { id: testId, student_id: studentId, test_type: "time_based" },
      });

      if (!session || session.status !== "in_progress") {
        socket.emit("tb:error", { message: "Test not active" });
        return;
      }

      if (await checkAndAutoSubmitTb(socket, session, studentId, logger)) return;

      await TestAnswer.update(
        {
          is_skipped: true,
          is_correct: false,
          time_taken: timeTaken,
        },
        {
          where: {
            test_session_id: testId,
            question_id: questionId,
            selected_answer: null,
          },
        }
      );

      const nextQData = await TimeBasedService.getNextQuestion(testId, studentId, questionId, false);

      if (nextQData.allCorrect) {
        socket.emit("tb:all_correct", { testId });
      } else {
        socket.emit("tb:next_question", {
          testId,
          question: nextQData.question,
        });
      }
    } catch (error: any) {
      logger.error("tb:skip error", { error: error.message, stack: error.stack });
      socket.emit("tb:error", { message: "Failed to skip question" });
    }
  });

  socket.on("tb:heartbeat", async (payload: TbHeartbeatPayload) => {
    try {
      const { testId } = payload;

      // Update session manager heartbeat
      sessionManager.updateHeartbeat(socket.id);

      const session = await TestSession.findOne({
        where: { id: testId, student_id: studentId, test_type: "time_based" },
        attributes: ["id", "ends_at", "status"],
      });

      if (!session) return;

      if (await checkAndAutoSubmitTb(socket, session, studentId, logger)) return;

      socket.emit("tb:time_update", {
        testId,
        timeRemaining: getTimeRemaining(session.ends_at),
      });
    } catch (error: any) {
      logger.error("tb:heartbeat error", { error: error.message, stack: error.stack });
    }
  });

  socket.on("tb:submit", async (payload: TbSubmitPayload) => {
    try {
      const { testId } = payload;

      const result = await TimeBasedService.submit(testId, studentId);

      sessionManager.removeSession(socket.id);
      socket.leave(`tb_test:${testId}`);

      socket.emit("tb:test_submitted", {
        testId,
        result,
        reason: "manual",
      });
    } catch (error: any) {
      logger.error("tb:submit error", { error: error.message, stack: error.stack });
      socket.emit("tb:error", { message: error.message || "Failed to submit test" });
    }
  });
}
