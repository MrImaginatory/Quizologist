import { Op } from "sequelize";
import TestSession from "../testSession/testSession.model";
import TestSelection from "../testSelection/testSelection.model";
import Question from "../question/question.model";
import TestAnswer from "../testAnswer/testAnswer.model";
import { ApiError } from "../../utils/ApiError";
import { StartTimeBasedInput } from "./timeBased.validation";
import { TestSessionService } from "../testSession/testSession.service";
import crypto from "crypto";

const DIFFICULTY_LEVELS = ["beginner", "normal", "mid", "hard", "expert"] as const;

// Type definitions for tb_state
interface QuestionWithDifficulty {
  id: string;
  difficulty: "beginner" | "normal" | "mid" | "hard" | "expert";
}

export interface TimeBasedState {
  phase: "primary" | "retry";
  cycleLevel: number;
  cycleThreshold: number;
  cycleCorrect: number;
  allQuestionsWithDifficulty: QuestionWithDifficulty[];
  seenIds: string[];
  incorrectIds: string[];
}

export class TimeBasedService {
  private static shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  static async start(data: StartTimeBasedInput, studentId: string) {
    // Check for existing active test
    const activeTest = await TestSession.findOne({
      where: {
        student_id: studentId,
        status: { [Op.in]: ["pending", "in_progress"] },
      },
    });

    if (activeTest) {
      throw ApiError.badRequest("You already have an active test. Please submit or abandon it first.");
    }

    // Build conditions for questions
    const selectionConditions = data.selections.map((sel) => {
      const condition: any = { course_id: sel.course_id };
      if (sel.subject_id) condition.subject_id = sel.subject_id;
      if (sel.topic_id) condition.topic_id = sel.topic_id;
      return condition;
    });

    // Fetch all eligible questions
    const allQuestions = await Question.findAll({
      where: { [Op.or]: selectionConditions },
      attributes: ["id", "difficulty"],
      raw: true,
    });

    if (allQuestions.length === 0) {
      throw ApiError.badRequest("No questions found for the selected criteria.");
    }

    const shuffledQuestions = this.shuffleArray(allQuestions) as QuestionWithDifficulty[];

    const testId = `TB-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const endsAt = new Date(Date.now() + data.duration_minutes * 60 * 1000);

    const initialTbState: TimeBasedState = {
      phase: "primary",
      cycleLevel: 0,
      cycleThreshold: Math.floor(Math.random() * 3) + 2, // 2 to 4
      cycleCorrect: 0,
      allQuestionsWithDifficulty: shuffledQuestions,
      seenIds: [],
      incorrectIds: [],
    };

    const session = await TestSession.create({
      test_id: testId,
      student_id: studentId,
      status: "in_progress",
      test_type: "time_based",
      duration_minutes: data.duration_minutes,
      question_limit: 0, // Time based has no fixed limit
      ends_at: endsAt,
      total_questions: 0, // Will be updated on submit
      tb_state: initialTbState,
      started_at: new Date(),
    });

    // Create selection records
    await Promise.all(
      data.selections.map((sel) =>
        TestSelection.create({
          test_session_id: session.id,
          course_id: sel.course_id,
          subject_id: sel.subject_id,
          topic_id: sel.topic_id,
        })
      )
    );

    // Get the first question
    const { question, allCorrect } = await this.getNextQuestionInternal(session, null, null);

    return {
      session: {
        id: session.id,
        test_id: session.test_id,
        duration_minutes: session.duration_minutes,
        ends_at: session.ends_at,
        status: session.status,
        test_type: session.test_type,
      },
      question,
      allCorrect,
    };
  }

  static async getNextQuestion(sessionId: string, studentId: string, lastQuestionId: string | null, wasCorrect: boolean | null) {
    const session = await TestSession.findOne({
      where: { id: sessionId, student_id: studentId, test_type: "time_based" }
    });

    if (!session) {
      throw ApiError.notFound("Time-based test session not found");
    }

    if (session.status === "completed" || session.status === "abandoned") {
      throw ApiError.badRequest("Test is no longer active");
    }

    return this.getNextQuestionInternal(session, lastQuestionId, wasCorrect);
  }

  private static async getNextQuestionInternal(session: TestSession, lastQuestionId: string | null, wasCorrect: boolean | null) {
    let tbState: TimeBasedState = session.tb_state as any;

    if (lastQuestionId) {
      if (!tbState.seenIds.includes(lastQuestionId)) {
        tbState.seenIds.push(lastQuestionId);
      }
      
      if (wasCorrect) {
        if (tbState.phase === "primary") {
           tbState.cycleCorrect++;
           if (tbState.cycleCorrect >= tbState.cycleThreshold) {
              tbState.cycleLevel = Math.min(4, tbState.cycleLevel + 1);
              tbState.cycleCorrect = 0;
              tbState.cycleThreshold = Math.floor(Math.random() * 3) + 2;
           }
        } else {
           tbState.incorrectIds = tbState.incorrectIds.filter(id => id !== lastQuestionId);
           tbState.cycleCorrect++;
           if (tbState.cycleCorrect >= tbState.cycleThreshold) {
              tbState.cycleLevel = Math.min(4, tbState.cycleLevel + 1);
              if (tbState.cycleLevel === 4 && tbState.cycleCorrect >= tbState.cycleThreshold) {
                  // After expert threshold is met in retry, we optionally could wrap to beginner.
                  // For now we'll wrap when we run out of expert questions.
              } else {
                  tbState.cycleCorrect = 0;
                  tbState.cycleThreshold = Math.floor(Math.random() * 3) + 2;
              }
           }
        }
      } else {
        // Was incorrect or skipped
        if (tbState.phase === "primary") {
           tbState.cycleCorrect = 0;
           if (!tbState.incorrectIds.includes(lastQuestionId)) {
               tbState.incorrectIds.push(lastQuestionId);
           }
        } else {
           tbState.cycleCorrect = 0;
        }
      }
    }

    let nextQuestionId: string | null = null;
    let targetDifficulty = DIFFICULTY_LEVELS[tbState.cycleLevel];

    if (tbState.phase === "primary") {
       // Primary phase: find unseen question matching target difficulty
       const unseenQuestions = tbState.allQuestionsWithDifficulty.filter(q => !tbState.seenIds.includes(q.id));
       
       if (unseenQuestions.length === 0) {
           // Switch to retry phase
           tbState.phase = "retry";
           tbState.cycleLevel = 0;
           tbState.cycleCorrect = 0;
           tbState.cycleThreshold = Math.floor(Math.random() * 3) + 2;
           targetDifficulty = DIFFICULTY_LEVELS[tbState.cycleLevel];
       } else {
           const targetQ = unseenQuestions.find(q => q.difficulty === targetDifficulty);
           if (targetQ) {
               nextQuestionId = targetQ.id;
           } else {
               nextQuestionId = unseenQuestions[0].id;
           }
       }
    }

    if (tbState.phase === "retry") {
        if (tbState.incorrectIds.length === 0) {
            session.set('tb_state', JSON.parse(JSON.stringify(tbState)));
            session.changed('tb_state', true);
            await session.save();
            return { question: null, allCorrect: true };
        }

        // Retry phase: loop Beginner to Expert
        const retryQuestions = tbState.allQuestionsWithDifficulty.filter(q => tbState.incorrectIds.includes(q.id));
        
        let targetQ = retryQuestions.find(q => q.difficulty === targetDifficulty);
        if (targetQ) {
            nextQuestionId = targetQ.id;
        } else {
            // If no questions exist for this level, just pick the next available one and reset/advance cycle
            // Or just wrap cycle if we're at expert
            if (tbState.cycleLevel === 4) {
                tbState.cycleLevel = 0;
            } else {
                tbState.cycleLevel++;
            }
            tbState.cycleCorrect = 0;
            tbState.cycleThreshold = Math.floor(Math.random() * 3) + 2;
            nextQuestionId = retryQuestions[0].id; // Fallback
        }
    }

    // Critical: mark the question we are about to serve as "seen" NOW so the
    // next call cannot pick it again as an "unseen" question.
    if (nextQuestionId && !tbState.seenIds.includes(nextQuestionId)) {
      tbState.seenIds.push(nextQuestionId);
    }

    session.set('tb_state', JSON.parse(JSON.stringify(tbState)));
    session.changed('tb_state', true);
    await session.save();

    if (!nextQuestionId) {
       return { question: null, allCorrect: true }; // Should not really happen unless empty incorrectIds
    }

    const question = await Question.findByPk(nextQuestionId);
    if (!question) {
        throw new Error(`Question ${nextQuestionId} not found`);
    }

    await TestAnswer.create({
      test_session_id: session.id,
      question_id: question.id,
      time_taken: 0,
      is_skipped: false,
    });

    const questionJson = question.toJSON() as any;
    delete questionJson.correctAnswer;
    delete questionJson.explanation;

    return { question: questionJson, allCorrect: false };
  }

  static async submit(sessionId: string, studentId: string) {
      // Re-use existing submit logic since we've updated total_questions behavior in the plan
      const session = await TestSession.findOne({
          where: { id: sessionId, student_id: studentId }
      });

      if (!session) {
          throw ApiError.notFound("Session not found");
      }

      // Update total_questions to the actual number of answers made
      const answersCount = await TestAnswer.count({ where: { test_session_id: sessionId } });
      await session.update({ total_questions: answersCount });

      return TestSessionService.submit(sessionId, studentId);
  }
}
