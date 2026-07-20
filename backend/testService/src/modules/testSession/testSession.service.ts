import { Op } from "sequelize";
import { sequelize } from "../../config/database";
import { ApiError } from "../../utils/ApiError";
import { RESPONSE_MESSAGES } from "../../utils/responseMessages";
import TestSession from "./testSession.model";
import TestAnswer from "../testAnswer/testAnswer.model";
import TestSelection from "../testSelection/testSelection.model";
import Enrollment from "../enrollment/enrollment.model";
import Question from "../question/question.model";
import Course from "../course/course.model";
import Subject from "../subject/subject.model";
import Topic from "../topic/topic.model";
import TeacherAssignment from "../teacherAssignment/teacherAssignment.model";
import {
  StartTestInput,
  TestIdParam,
  GetTestsByStudentInput,
  GetAllTestsInput,
  PaginationInput,
} from "./testSession.validation";

const TIMESTAMP_EXCLUDE = {
  exclude: ["createdAt", "updatedAt", "deletedAt"],
};

const COURSE_INCLUDE = { model: Course, as: "course", attributes: ["id", "name"] };
const SUBJECT_INCLUDE = { model: Subject, as: "subject", attributes: ["id", "name"] };
const TOPIC_INCLUDE = { model: Topic, as: "topic", attributes: ["id", "name"] };
const SELECTION_INCLUDE = {
  model: TestSelection,
  as: "selections",
  attributes: ["course_id", "subject_id", "topic_id"],
  include: [COURSE_INCLUDE, SUBJECT_INCLUDE, TOPIC_INCLUDE],
};

async function getTeacherAssignmentPairs(teacherId: string): Promise<{ course_id: string; subject_id: string | null }[]> {
  const assignments = await TeacherAssignment.findAll({
    where: { teacher_id: teacherId },
    attributes: ["course_id", "subject_id"],
    raw: true,
  });
  return assignments.map((a: any) => ({ course_id: a.course_id, subject_id: a.subject_id }));
}

function generateTestId(firstName: string, lastName: string): string {
  const now = new Date();
  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const day = days[now.getDay()];
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const time = now.toTimeString().slice(0, 8).replace(/:/g, "");
  return `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${day}_${date}_${time}`;
}

function flattenSelections(session: any) {
  const plain = session.toJSON ? session.toJSON() : session;
  const selections = plain.selections || [];
  if (selections.length > 0) {
    plain.course = selections[0].course || null;
    plain.subject = selections[0].subject || null;
    plain.topic = selections[0].topic || null;
  } else {
    plain.course = null;
    plain.subject = null;
    plain.topic = null;
  }
  delete plain.selections;
  return plain;
}

function stripQuestionForTest(q: any) {
  return {
    index: q._index,
    questionId: q.id,
    question: q.question,
    choices: q.choices,
    difficulty: q.difficulty,
    topicName: q.topic?.name || null,
    subjectName: q.subject?.name || null,
    courseName: q.course?.name || null,
  };
}

export class TestSessionService {
  static async start(data: StartTestInput, studentId: string, studentName: string) {
    // Check if student already has an in_progress test
    const activeTest = await TestSession.findOne({
      where: {
        student_id: studentId,
        status: { [Op.in]: ["pending", "in_progress"] },
      },
    });

    if (activeTest) {
      throw ApiError.conflict(
        "You already have an active test. Complete or abandon it before starting a new one."
      );
    }

    // Prevent duplicate test creation within 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentTest = await TestSession.findOne({
      where: {
        student_id: studentId,
        createdAt: { [Op.gte]: fiveMinutesAgo },
      },
    });

    if (recentTest) {
      throw ApiError.conflict(
        "Please wait 5 minutes before creating another test."
      );
    }

    // Auto-abandon tests older than 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await TestSession.update(
      { status: "abandoned" },
      {
        where: {
          student_id: studentId,
          status: { [Op.in]: ["pending", "in_progress"] },
          createdAt: { [Op.lt]: twentyFourHoursAgo },
        },
      }
    );

    // Validate enrollment for each selection (hierarchical check)
    for (const selection of data.selections) {
      // Check if student has ANY enrollment for this course
      const enrollment = await Enrollment.findOne({
        where: {
          student_id: studentId,
          course_id: selection.course_id,
        },
      });

      if (!enrollment) {
        throw ApiError.badRequest(
          `You are not enrolled in the selected course`
        );
      }
    }

    // Fetch questions based on selections (union of all selections)
    const questionConditions: any[] = [];

    for (const selection of data.selections) {
      const condition: any = { course_id: selection.course_id };
      if (selection.subject_id) condition.subject_id = selection.subject_id;
      if (selection.topic_id) condition.topic_id = selection.topic_id;
      questionConditions.push(condition);
    }

    const questions = await Question.findAll({
      where: {
        [Op.or]: questionConditions,
      },
      include: [
        { model: Topic, as: "topic", attributes: ["id", "name"] },
        { model: Subject, as: "subject", attributes: ["id", "name"] },
        { model: Course, as: "course", attributes: ["id", "name"] },
      ],
      order: sequelize.random(),
    });

    if (questions.length === 0) {
      throw ApiError.badRequest(RESPONSE_MESSAGES.ERROR.NO_QUESTIONS);
    }

    // Apply question limit (use all available if less than requested)
    const actualQuestionCount = Math.min(questions.length, data.question_limit);
    const selectedQuestions = questions.slice(0, actualQuestionCount);

    // Generate test ID
    const nameParts = studentName.split(" ");
    const firstName = nameParts[0] || "student";
    const lastName = nameParts.slice(1).join(" ") || "user";
    const testId = generateTestId(firstName, lastName);

    // Calculate end time
    const startedAt = new Date();
    const endsAt = new Date(startedAt.getTime() + data.duration_minutes * 60 * 1000);

    // Create test session
    const session = await TestSession.create({
      test_id: testId,
      student_id: studentId,
      status: "in_progress",
      duration_minutes: data.duration_minutes,
      question_limit: data.question_limit,
      ends_at: endsAt,
      total_questions: actualQuestionCount,
      started_at: startedAt,
    });

    // Create answer stubs for each question
    const answerStubs = selectedQuestions.map((q) => ({
      test_session_id: session.id,
      question_id: q.id,
      time_taken: 0,
      is_skipped: false,
    }));

    await TestAnswer.bulkCreate(answerStubs);

    // Create test selections
    const selectionStubs = data.selections.map((s) => ({
      test_session_id: session.id,
      course_id: s.course_id,
      subject_id: s.subject_id || null,
      topic_id: s.topic_id || null,
    }));

    await TestSelection.bulkCreate(selectionStubs);

    // Add index to questions for client reference
    const questionsWithIndex = selectedQuestions.map((q, index) => {
      const plain = q.toJSON();
      (plain as any)._index = index;
      return plain;
    });

    return {
      id: session.id,
      test_id: session.test_id,
      status: session.status,
      duration_minutes: session.duration_minutes,
      question_limit: session.question_limit,
      ends_at: session.ends_at,
      totalQuestions: session.total_questions,
      questions: questionsWithIndex.map(stripQuestionForTest),
    };
  }

  static async getById(data: TestIdParam, studentId: string) {
    const session = await TestSession.findOne({
      where: { id: data.testId, student_id: studentId },
      attributes: TIMESTAMP_EXCLUDE,
      include: [
        SELECTION_INCLUDE,
        {
          model: TestAnswer,
          as: "answers",
          attributes: ["question_id", "createdAt"],
          include: [
            {
              model: Question,
              as: "question",
              attributes: ["id", "question", "choices", "difficulty"],
              include: [
                { model: Topic, as: "topic", attributes: ["id", "name"] },
                { model: Subject, as: "subject", attributes: ["id", "name"] },
                { model: Course, as: "course", attributes: ["id", "name"] },
              ],
            },
          ],
        },
      ],
      order: [[{ model: TestAnswer, as: "answers" }, "createdAt", "ASC"]],
    });

    if (!session) {
      throw ApiError.notFound(RESPONSE_MESSAGES.ERROR.TEST_NOT_FOUND);
    }

    const plain = session.toJSON ? session.toJSON() : (session as any);
    const answers: any[] = plain.answers || [];

    const questions = answers.map((a: any, index: number) => ({
      index,
      questionId: a.question?.id || "",
      question: a.question?.question || "",
      choices: a.question?.choices || [],
      difficulty: a.question?.difficulty || "",
      topicName: a.question?.topic?.name || null,
      subjectName: a.question?.subject?.name || null,
      courseName: a.question?.course?.name || null,
    }));

    // Build selections-flattened base
    const selections: any[] = plain.selections || [];
    if (selections.length > 0) {
      plain.course = selections[0].course || null;
      plain.subject = selections[0].subject || null;
      plain.topic = selections[0].topic || null;
    } else {
      plain.course = null;
      plain.subject = null;
      plain.topic = null;
    }
    delete plain.selections;
    delete plain.answers;

    return {
      ...plain,
      totalQuestions: questions.length,
      questions,
    };
  }



  static async getHistory(studentId: string, data: PaginationInput) {
    const { page, limit } = data;
    const offset = (page - 1) * limit;

    const { rows, count } = await TestSession.findAndCountAll({
      where: { student_id: studentId },
      attributes: TIMESTAMP_EXCLUDE,
      include: [SELECTION_INCLUDE],
      limit,
      offset,
      order: [["started_at", "DESC"]],
    });

    return {
      tests: rows.map((t) => flattenSelections(t)),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  static async getByStudentId(data: GetTestsByStudentInput, query: PaginationInput) {
    const { page, limit } = query;
    const offset = (page - 1) * limit;

    const { rows, count } = await TestSession.findAndCountAll({
      where: { student_id: data.studentId },
      attributes: TIMESTAMP_EXCLUDE,
      include: [SELECTION_INCLUDE],
      limit,
      offset,
      order: [["started_at", "DESC"]],
    });

    return {
      tests: rows.map((t) => flattenSelections(t)),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  static async getAll(data: GetAllTestsInput) {
    const { page, limit, status, subjectId, dateFrom, dateTo } = data;
    const offset = (page - 1) * limit;

    const whereClause: any = {};
    if (status) whereClause.status = status;
    if (subjectId) whereClause.subject_id = subjectId;
    if (dateFrom || dateTo) {
      whereClause.started_at = {};
      if (dateFrom) whereClause.started_at[Op.gte] = new Date(dateFrom);
      if (dateTo) whereClause.started_at[Op.lte] = new Date(dateTo);
    }

    const { rows, count } = await TestSession.findAndCountAll({
      where: whereClause,
      attributes: TIMESTAMP_EXCLUDE,
      include: [SELECTION_INCLUDE],
      limit,
      offset,
      order: [["started_at", "DESC"]],
    });

    return {
      tests: rows.map((t) => flattenSelections(t)),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  static async getTestDetailForAdmin(data: TestIdParam, requesterId?: string, requesterRole?: string) {
    const session = await TestSession.findOne({
      where: { id: data.testId },
    });

    if (!session) {
      throw ApiError.notFound(RESPONSE_MESSAGES.ERROR.TEST_NOT_FOUND);
    }

    // For teachers, verify the test session's selections match their assignments
    if (requesterRole === "teacher" && requesterId) {
      const assignmentPairs = await getTeacherAssignmentPairs(requesterId);
      if (assignmentPairs.length === 0) {
        throw ApiError.forbidden("You do not have permission to view this test");
      }

      const selections = await TestSelection.findAll({
        where: { test_session_id: session.id },
        attributes: ["course_id", "subject_id"],
        raw: true,
      });

      // Check if ANY selection matches the teacher's assignments
      const hasMatchingSelection = selections.some((sel: any) => {
        return assignmentPairs.some((pair) => {
          if (pair.subject_id) {
            return sel.course_id === pair.course_id && sel.subject_id === pair.subject_id;
          }
          return sel.course_id === pair.course_id;
        });
      });

      if (!hasMatchingSelection) {
        throw ApiError.forbidden("You do not have permission to view this test");
      }
    }

    const answers = await TestAnswer.findAll({
      where: { test_session_id: session.id },
      order: [["createdAt", "ASC"]],
    });

    const questionsData = await Promise.all(
      answers.map(async (answer, index) => {
        const question = await Question.findByPk(answer.question_id, {
          include: [
            { model: Topic, as: "topic", attributes: ["id", "name"] },
            { model: Subject, as: "subject", attributes: ["id", "name"] },
            { model: Course, as: "course", attributes: ["id", "name"] },
          ],
        });

        const q = question?.toJSON() as any;

        return {
          index,
          question: q?.question || "",
          choices: q?.choices || [],
          selectedAnswer: answer.selected_answer,
          correctAnswer: q?.correctAnswer || "",
          isCorrect: answer.is_correct,
          explanation: q?.explanation || null,
          videoUrl: q?.videoUrl || null,
          timeTaken: answer.time_taken,
          topicName: q?.topic?.name || null,
          subjectName: q?.subject?.name || null,
          courseName: q?.course?.name || null,
        };
      })
    );

    return {
      id: session.id,
      test_id: session.test_id,
      student_id: session.student_id,
      status: session.status,
      totalQuestions: session.total_questions,
      attempted: session.attempted,
      skipped: session.skipped,
      correct: session.correct,
      incorrect: session.incorrect,
      score: parseFloat(session.score as any),
      disconnectCount: session.disconnect_count,
      startedAt: session.started_at,
      completedAt: session.completed_at,
      questions: questionsData,
    };
  }

  static async getStudentPerformance(studentId: string, requesterId?: string, requesterRole?: string) {
    // For teachers, filter by their assigned courses/subjects
    let whereCondition: any = {
      student_id: studentId,
      status: "completed",
    };

    if (requesterRole === "teacher" && requesterId) {
      const assignmentPairs = await getTeacherAssignmentPairs(requesterId);
      if (assignmentPairs.length === 0) {
        return {
          studentId,
          totalTests: 0,
          averageScore: 0,
          highestScore: 0,
          lowestScore: 0,
          totalQuestions: 0,
          totalCorrect: 0,
          totalIncorrect: 0,
          totalSkipped: 0,
        };
      }

      const matchingSelections = await TestSelection.findAll({
        where: {
          [Op.or]: assignmentPairs.flatMap((pair) => {
            if (pair.subject_id) {
              // Match selection with specific subject OR selection with null subject (all subjects)
              return [
                { course_id: pair.course_id, subject_id: pair.subject_id },
                { course_id: pair.course_id, subject_id: null },
              ];
            }
            // Course-level assignment — match any selection for this course
            return [{ course_id: pair.course_id }];
          }),
        },
        attributes: ["test_session_id"],
        raw: true,
      });
      const testSessionIds = [...new Set(matchingSelections.map((s: any) => s.test_session_id))];

      if (testSessionIds.length === 0) {
        return {
          studentId,
          totalTests: 0,
          averageScore: 0,
          highestScore: 0,
          lowestScore: 0,
          totalQuestions: 0,
          totalCorrect: 0,
          totalIncorrect: 0,
          totalSkipped: 0,
        };
      }

      whereCondition.id = { [Op.in]: testSessionIds };
    }

    const sessions = await TestSession.findAll({
      where: whereCondition,
    });

    if (sessions.length === 0) {
      return {
        studentId,
        totalTests: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        totalQuestions: 0,
        totalCorrect: 0,
        totalIncorrect: 0,
        totalSkipped: 0,
      };
    }

    const scores = sessions.map((s) => parseFloat(s.score as any));
    const totalQuestions = sessions.reduce((sum, s) => sum + s.total_questions, 0);
    const totalCorrect = sessions.reduce((sum, s) => sum + s.correct, 0);
    const totalIncorrect = sessions.reduce((sum, s) => sum + s.incorrect, 0);
    const totalSkipped = sessions.reduce((sum, s) => sum + s.skipped, 0);

    return {
      studentId,
      totalTests: sessions.length,
      averageScore: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100,
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
      totalQuestions,
      totalCorrect,
      totalIncorrect,
      totalSkipped,
    };
  }

  static async getStudentResults(
    studentId: string,
    requesterId: string,
    requesterRole: string,
    query: PaginationInput
  ) {
    // Students can only view their own results; admin/teacher can view any
    if (requesterRole === "student" && requesterId !== studentId) {
      throw ApiError.forbidden("You can only view your own results");
    }

    const { page, limit } = query;
    const offset = (page - 1) * limit;

    // For teachers, get their assigned course/subject pairs
    let allowedSelectionWhere: any = undefined;
    if (requesterRole === "teacher") {
      const assignmentPairs = await getTeacherAssignmentPairs(requesterId);
      if (assignmentPairs.length === 0) {
        return {
          results: [],
          pagination: { total: 0, page, limit, totalPages: 0 },
        };
      }

      // Build OR conditions: match test selections against teacher's assignments
      // A test is visible if ANY of its selections match a teacher's assignment
      allowedSelectionWhere = {
        [Op.or]: assignmentPairs.map((pair) => {
          const condition: any = { course_id: pair.course_id };
          if (pair.subject_id) {
            condition.subject_id = pair.subject_id;
          }
          return condition;
        }),
      };
    }

    // Find test sessions that match the criteria
    let testSessionIds: string[] = [];

    if (allowedSelectionWhere) {
      // For teachers: find test sessions that have selections matching their assignments
      const matchingSelections = await TestSelection.findAll({
        where: allowedSelectionWhere,
        attributes: ["test_session_id"],
        raw: true,
      });
      testSessionIds = [...new Set(matchingSelections.map((s: any) => s.test_session_id))];

      if (testSessionIds.length === 0) {
        return {
          results: [],
          pagination: { total: 0, page, limit, totalPages: 0 },
        };
      }
    }

    const whereCondition: any = {
      student_id: studentId,
      status: "completed",
    };

    // For teachers, only show tests that have matching selections
    if (testSessionIds.length > 0) {
      whereCondition.id = { [Op.in]: testSessionIds };
    }

    const { rows, count } = await TestSession.findAndCountAll({
      where: whereCondition,
      attributes: [
        "id",
        "test_id",
        "student_id",
        "status",
        "total_questions",
        "attempted",
        "skipped",
        "correct",
        "incorrect",
        "score",
        "started_at",
        "completed_at",
      ],
      include: [SELECTION_INCLUDE],
      limit,
      offset,
      order: [["completed_at", "DESC"]],
    });

    const results = await Promise.all(
      rows.map(async (session) => {
        const answers = await TestAnswer.findAll({
          where: { test_session_id: session.id },
          order: [["createdAt", "ASC"]],
        });

        const questionsData = await Promise.all(
          answers.map(async (answer, index) => {
            const question = await Question.findByPk(answer.question_id, {
              include: [
                { model: Topic, as: "topic", attributes: ["id", "name"] },
                { model: Subject, as: "subject", attributes: ["id", "name"] },
                { model: Course, as: "course", attributes: ["id", "name"] },
              ],
            });

            const q = question?.toJSON() as any;

            return {
              index,
              question: q?.question || "",
              choices: q?.choices || [],
              selectedAnswer: answer.selected_answer,
              correctAnswer: q?.correctAnswer || "",
              isCorrect: answer.is_correct,
              explanation: q?.explanation || null,
              videoUrl: q?.videoUrl || null,
              timeTaken: answer.time_taken,
              topicName: q?.topic?.name || null,
              subjectName: q?.subject?.name || null,
              courseName: q?.course?.name || null,
            };
          })
        );

        return {
          id: session.id,
          test_id: session.test_id,
          student_id: session.student_id,
          status: session.status,
          totalQuestions: session.total_questions,
          attempted: session.attempted,
          skipped: session.skipped,
          correct: session.correct,
          incorrect: session.incorrect,
          score: parseFloat(session.score as any),
          startedAt: session.started_at,
          completedAt: session.completed_at,
          questions: questionsData,
        };
      })
    );

    return {
      results,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  static async getStudentResultSummary(
    studentId: string,
    requesterId: string,
    requesterRole: string,
    query: PaginationInput
  ) {
    if (requesterRole === "student" && requesterId !== studentId) {
      throw ApiError.forbidden("You can only view your own results");
    }

    const { page, limit } = query;
    const offset = (page - 1) * limit;

    // For teachers, get their assigned course/subject pairs
    let testSessionIds: string[] = [];
    if (requesterRole === "teacher") {
      const assignmentPairs = await getTeacherAssignmentPairs(requesterId);
      if (assignmentPairs.length === 0) {
        return {
          results: [],
          pagination: { total: 0, page, limit, totalPages: 0 },
        };
      }

      const matchingSelections = await TestSelection.findAll({
        where: {
          [Op.or]: assignmentPairs.flatMap((pair) => {
            if (pair.subject_id) {
              // Match selection with specific subject OR selection with null subject (all subjects)
              return [
                { course_id: pair.course_id, subject_id: pair.subject_id },
                { course_id: pair.course_id, subject_id: null },
              ];
            }
            // Course-level assignment — match any selection for this course
            return [{ course_id: pair.course_id }];
          }),
        },
        attributes: ["test_session_id"],
        raw: true,
      });
      testSessionIds = [...new Set(matchingSelections.map((s: any) => s.test_session_id))];

      if (testSessionIds.length === 0) {
        return {
          results: [],
          pagination: { total: 0, page, limit, totalPages: 0 },
        };
      }
    }

    const whereCondition: any = {
      student_id: studentId,
      status: "completed",
    };

    if (testSessionIds.length > 0) {
      whereCondition.id = { [Op.in]: testSessionIds };
    }

    const { rows, count } = await TestSession.findAndCountAll({
      where: whereCondition,
      attributes: [
        "id",
        "test_id",
        "total_questions",
        "attempted",
        "skipped",
        "correct",
        "incorrect",
        "score",
        "duration_minutes",
        "disconnect_count",
        "started_at",
        "completed_at",
      ],
      include: [
        {
          model: TestSelection,
          as: "selections",
          attributes: ["course_id", "subject_id", "topic_id"],
          include: [COURSE_INCLUDE, SUBJECT_INCLUDE, TOPIC_INCLUDE],
        },
      ],
      limit,
      offset,
      order: [["completed_at", "DESC"]],
    });

    const summary = rows.map((session) => {
      const plain = session.toJSON() as any;
      const selections = plain.selections || [];
      const courses = [...new Set(selections.map((s: any) => s.course?.name).filter(Boolean))];
      const subjects = [...new Set(selections.map((s: any) => s.subject?.name).filter(Boolean))];

      return {
        id: plain.id,
        testId: plain.test_id,
        score: parseFloat(plain.score),
        totalQuestions: plain.total_questions,
        attempted: plain.attempted,
        correct: plain.correct,
        incorrect: plain.incorrect,
        skipped: plain.skipped,
        accuracy: plain.total_questions > 0
          ? Math.round((plain.correct / plain.total_questions) * 100)
          : 0,
        durationMinutes: plain.duration_minutes,
        disconnects: plain.disconnect_count,
        courses,
        subjects,
        startedAt: plain.started_at,
        completedAt: plain.completed_at,
      };
    });

    return {
      results: summary,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  static async getResult(data: TestIdParam, studentId: string) {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.testId);
    const session = await TestSession.findOne({
      where: isUUID 
        ? { id: data.testId, student_id: studentId }
        : { test_id: data.testId, student_id: studentId }
    });

    if (!session) {
      throw ApiError.notFound(RESPONSE_MESSAGES.ERROR.TEST_NOT_FOUND);
    }

    if (session.status !== "completed") {
      throw ApiError.badRequest(RESPONSE_MESSAGES.ERROR.TEST_NOT_COMPLETED);
    }

    const answers = await TestAnswer.findAll({
      where: { test_session_id: session.id },
      order: [["createdAt", "ASC"]],
    });

    // Fetch full question data for each answer
    const questionsData = await Promise.all(
      answers.map(async (answer, index) => {
        const question = await Question.findByPk(answer.question_id, {
          include: [
            { model: Topic, as: "topic", attributes: ["id", "name"] },
            { model: Subject, as: "subject", attributes: ["id", "name"] },
            { model: Course, as: "course", attributes: ["id", "name"] },
          ],
        });

        const q = question?.toJSON() as any;

        return {
          index,
          question: q?.question || "",
          choices: q?.choices || [],
          selectedAnswer: answer.selected_answer,
          correctAnswer: q?.correctAnswer || "",
          isCorrect: answer.is_correct,
          explanation: q?.explanation || null,
          videoUrl: q?.videoUrl || null,
          timeTaken: answer.time_taken,
          topicName: q?.topic?.name || null,
          subjectName: q?.subject?.name || null,
          courseName: q?.course?.name || null,
        };
      })
    );

    return {
      id: session.id,
      test_id: session.test_id,
      status: session.status,
      totalQuestions: session.total_questions,
      attempted: session.attempted,
      skipped: session.skipped,
      correct: session.correct,
      incorrect: session.incorrect,
      score: parseFloat(session.score as any),
      disconnectCount: session.disconnect_count,
      startedAt: session.started_at,
      completedAt: session.completed_at,
      questions: questionsData,
    };
  }

  static async submit(testId: string, studentId: string) {
    const session = await TestSession.findOne({
      where: { id: testId, student_id: studentId },
    });

    if (!session) {
      throw ApiError.notFound(RESPONSE_MESSAGES.ERROR.TEST_NOT_FOUND);
    }

    if (session.status === "completed") {
      throw ApiError.badRequest("This test has already been submitted");
    }

    if (session.status === "abandoned") {
      throw ApiError.badRequest("This test has been abandoned");
    }

    // Fetch all answers
    const answers = await TestAnswer.findAll({
      where: { test_session_id: testId },
    });

    // Fetch all questions to compare answers
    const questionIds = answers.map((a) => a.question_id);
    const questions = await Question.findAll({
      where: { id: { [Op.in]: questionIds } },
    });

    const questionMap = new Map(questions.map((q) => [q.id, q]));

    // Grade each answer
    let correct = 0;
    let incorrect = 0;
    let skipped = 0;
    let attempted = 0;

    for (const answer of answers) {
      if (answer.is_skipped || !answer.selected_answer) {
        skipped++;
        await answer.update({ is_correct: false });
        continue;
      }

      attempted++;
      const question = questionMap.get(answer.question_id);
      const isCorrect = question?.correctAnswer === answer.selected_answer;

      if (isCorrect) {
        correct++;
      } else {
        incorrect++;
      }

      await answer.update({ is_correct: isCorrect });
    }

    // Calculate score
    const score = session.total_questions > 0
      ? (correct / session.total_questions) * 100
      : 0;

    // Update session
    await session.update({
      status: "completed",
      attempted,
      skipped,
      correct,
      incorrect,
      score: Math.round(score * 100) / 100,
      completed_at: new Date(),
    });

    return {
      id: session.id,
      test_id: session.test_id,
      status: "completed",
      totalQuestions: session.total_questions,
      attempted,
      skipped,
      correct,
      incorrect,
      score: Math.round(score * 100) / 100,
    };
  }

  static async abandon(testId: string, studentId: string) {
    const session = await TestSession.findOne({
      where: { id: testId, student_id: studentId },
    });

    if (!session) {
      throw ApiError.notFound(RESPONSE_MESSAGES.ERROR.TEST_NOT_FOUND);
    }

    if (session.status === "completed") {
      throw ApiError.badRequest("This test has already been completed");
    }

    if (session.status === "abandoned") {
      throw ApiError.badRequest("This test has already been abandoned");
    }

    await session.update({ status: "abandoned" });

    return {
      id: session.id,
      test_id: session.test_id,
      status: "abandoned",
    };
  }
}
