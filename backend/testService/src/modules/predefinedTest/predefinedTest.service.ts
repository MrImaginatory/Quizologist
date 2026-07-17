import { Op } from "sequelize";
import crypto from "crypto";
import PredefinedTest from "./predefinedTest.model";
import PredefinedTestQuestion from "./predefinedTestQuestion.model";
import PredefinedTestStudent from "./predefinedTestStudent.model";
import Question from "../question/question.model";
import Course from "../course/course.model";
import Subject from "../subject/subject.model";
import Topic from "../topic/topic.model";
import { ApiError } from "../../utils/ApiError";
import {
  CreatePredefinedTestInput,
  UpdatePredefinedTestInput,
  PredefinedTestQueryInput,
} from "./predefinedTest.validation";

function generateToken(): string {
  return crypto.randomBytes(16).toString("hex");
}

export class PredefinedTestService {
  // ==================== CRUD Operations ====================

  static async create(data: CreatePredefinedTestInput, createdBy: string): Promise<any> {
    const testLinkToken = generateToken();

    const test = await PredefinedTest.create({
      title: data.title,
      description: data.description || null,
      created_by: createdBy,
      status: "draft",
      is_scheduled: data.is_scheduled,
      start_time: data.start_time ? new Date(data.start_time) : null,
      end_time: data.end_time ? new Date(data.end_time) : null,
      timezone: data.timezone,
      duration_minutes: data.duration_minutes,
      question_limit: data.question_limit,
      difficulty: data.difficulty,
      difficulty_ratio: data.difficulty_ratio || null,
      use_fixed_questions: data.use_fixed_questions,
      use_specific_students: data.use_specific_students,
      max_attempts: data.max_attempts,
      course_ids: data.course_ids,
      subject_ids: data.subject_ids || null,
      topic_ids: data.topic_ids || null,
      test_link_token: testLinkToken,
    });

    // Add fixed questions if provided
    if (data.use_fixed_questions && data.fixed_question_ids && data.fixed_question_ids.length > 0) {
      const questionRecords = data.fixed_question_ids.map((questionId, index) => ({
        predefined_test_id: test.id,
        question_id: questionId,
        order: index + 1,
      }));
      await PredefinedTestQuestion.bulkCreate(questionRecords);
    }

    // Add student assignments if provided
    if (data.student_ids && data.student_ids.length > 0) {
      const studentRecords = data.student_ids.map((studentId) => ({
        predefined_test_id: test.id,
        student_id: studentId,
        status: "assigned" as const,
      }));
      await PredefinedTestStudent.bulkCreate(studentRecords);
    }

    return test.toJSON();
  }

  static async getAll(filters: PredefinedTestQueryInput, userId: string, userRole: string): Promise<any> {
    const { page, limit, status, course_id } = filters;
    const offset = (page - 1) * limit;

    const whereConditions: any = {};

    // Teacher can only see their own tests
    if (userRole === "teacher") {
      whereConditions.created_by = userId;
    }

    if (status) {
      whereConditions.status = status;
    }

    // Skip course_id filter for now - Op.contains may not work correctly
    // if (course_id) {
    //   whereConditions.course_ids = { [Op.contains]: [course_id] };
    // }

    const { rows, count } = await PredefinedTest.findAndCountAll({
      where: whereConditions,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    return {
      tests: rows.map((t) => t.toJSON()),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  static async getById(id: string, userId: string, userRole: string): Promise<any> {
    const test = await PredefinedTest.findByPk(id, {
      include: [
        { model: PredefinedTestQuestion, as: "fixedQuestions", include: [{ model: Question, as: "question" }] },
        { model: PredefinedTestStudent, as: "assignedStudents" },
      ],
    });

    if (!test) {
      throw ApiError.notFound("Predefined test not found");
    }

    // Teacher can only see their own tests
    if (userRole === "teacher" && test.created_by !== userId) {
      throw ApiError.forbidden("You do not have permission to view this test");
    }

    return test.toJSON();
  }

  static async update(id: string, data: UpdatePredefinedTestInput, userId: string, userRole: string): Promise<any> {
    const test = await PredefinedTest.findByPk(id);

    if (!test) {
      throw ApiError.notFound("Predefined test not found");
    }

    // Teacher can only update their own tests
    if (userRole === "teacher" && test.created_by !== userId) {
      throw ApiError.forbidden("You do not have permission to update this test");
    }

    // Only allow updates on draft or active tests
    if (test.status !== "draft" && test.status !== "active") {
      throw ApiError.badRequest("Cannot update test in current status");
    }

    // Update test fields
    if (data.title !== undefined) test.title = data.title;
    if (data.description !== undefined) test.description = data.description;
    if (data.is_scheduled !== undefined) test.is_scheduled = data.is_scheduled;
    if (data.start_time !== undefined) test.start_time = data.start_time ? new Date(data.start_time) : null;
    if (data.end_time !== undefined) test.end_time = data.end_time ? new Date(data.end_time) : null;
    if (data.timezone !== undefined) test.timezone = data.timezone;
    if (data.duration_minutes !== undefined) test.duration_minutes = data.duration_minutes;
    if (data.question_limit !== undefined) test.question_limit = data.question_limit;
    if (data.difficulty !== undefined) test.difficulty = data.difficulty;
    if (data.difficulty_ratio !== undefined) test.difficulty_ratio = data.difficulty_ratio;
    if (data.use_fixed_questions !== undefined) test.use_fixed_questions = data.use_fixed_questions;
    if (data.use_specific_students !== undefined) test.use_specific_students = data.use_specific_students;
    if (data.max_attempts !== undefined) test.max_attempts = data.max_attempts;
    if (data.course_ids !== undefined) test.course_ids = data.course_ids;
    if (data.subject_ids !== undefined) test.subject_ids = data.subject_ids;
    if (data.topic_ids !== undefined) test.topic_ids = data.topic_ids;

    await test.save();

    // Update fixed questions if provided
    if (data.fixed_question_ids !== undefined) {
      await PredefinedTestQuestion.destroy({ where: { predefined_test_id: id } });
      if (data.fixed_question_ids.length > 0) {
        const questionRecords = data.fixed_question_ids.map((questionId, index) => ({
          predefined_test_id: id,
          question_id: questionId,
          order: index + 1,
        }));
        await PredefinedTestQuestion.bulkCreate(questionRecords);
      }
    }

    // Update student assignments if provided
    if (data.student_ids !== undefined) {
      await PredefinedTestStudent.destroy({ where: { predefined_test_id: id } });
      if (data.student_ids.length > 0) {
        const studentRecords = data.student_ids.map((studentId) => ({
          predefined_test_id: id,
          student_id: studentId,
          status: "assigned" as const,
        }));
        await PredefinedTestStudent.bulkCreate(studentRecords);
      }
    }

    return test.toJSON();
  }

  static async delete(id: string, userId: string, userRole: string): Promise<void> {
    const test = await PredefinedTest.findByPk(id);

    if (!test) {
      throw ApiError.notFound("Predefined test not found");
    }

    // Teacher can only delete their own tests
    if (userRole === "teacher" && test.created_by !== userId) {
      throw ApiError.forbidden("You do not have permission to delete this test");
    }

    await test.destroy();
  }

  static async activate(id: string, userId: string): Promise<any> {
    const test = await PredefinedTest.findByPk(id);

    if (!test) {
      throw ApiError.notFound("Predefined test not found");
    }

    if (test.created_by !== userId) {
      throw ApiError.forbidden("You do not have permission to activate this test");
    }

    // Allow activation from draft or inactive status
    if (test.status !== "draft" && test.status !== "inactive") {
      throw ApiError.badRequest("Can only activate tests in draft or inactive status");
    }

    // Validate that fixed questions are selected if use_fixed_questions is true
    if (test.use_fixed_questions) {
      const fixedQuestions = await PredefinedTestQuestion.findAll({
        where: { predefined_test_id: id },
      });
      if (fixedQuestions.length === 0) {
        throw ApiError.badRequest("Cannot activate: No fixed questions selected. Please add questions first.");
      }
    }

    // Validate that students are selected if specific students are required
    const hasStudentAssignments = await PredefinedTestStudent.count({
      where: { predefined_test_id: id },
    });
    // Note: If no student assignments, it means auto-eligibility (all enrolled students)
    // This is valid, so we don't block activation

    test.status = "active";
    await test.save();

    return test.toJSON();
  }

  static async deactivate(id: string, userId: string): Promise<any> {
    const test = await PredefinedTest.findByPk(id);

    if (!test) {
      throw ApiError.notFound("Predefined test not found");
    }

    if (test.created_by !== userId) {
      throw ApiError.forbidden("You do not have permission to deactivate this test");
    }

    if (test.status !== "active") {
      throw ApiError.badRequest("Can only deactivate tests in active status");
    }

    test.status = "inactive";
    await test.save();

    return test.toJSON();
  }

  // ==================== Student Operations ====================

  static async getPendingTests(studentId: string): Promise<any> {
    // Find tests where:
    // 1. Test is active
    // 2. Student is either:
    //    a. Explicitly assigned in predefined_test_students, OR
    //    b. Enrolled in matching course/subject (auto-eligible)
    // 3. If scheduled, current time is within window OR test hasn't started yet
    // 4. Student hasn't exceeded max attempts

    const activeTests = await PredefinedTest.findAll({
      where: { status: "active" },
      order: [["createdAt", "DESC"]],
    });

    const pendingTests: any[] = [];

    for (const test of activeTests) {
      // Check schedule
      if (test.is_scheduled) {
        const now = new Date();
        if (test.start_time && now < test.start_time) {
          // Test hasn't started yet - include as upcoming
          pendingTests.push({
            ...test.toJSON(),
            status: "upcoming",
          });
          continue;
        }
        if (test.end_time && now > test.end_time) {
          // Test has ended - skip
          continue;
        }
      }

      // Check if student is explicitly assigned
      const assignedStudent = await PredefinedTestStudent.findOne({
        where: {
          predefined_test_id: test.id,
          student_id: studentId,
        },
      });

      if (assignedStudent) {
        // Check if student has remaining attempts
        if (assignedStudent.status === "completed" && test.max_attempts <= 1) {
          continue; // Already completed, no more attempts
        }
        pendingTests.push({
          ...test.toJSON(),
          student_status: assignedStudent.status,
        });
        continue;
      }

      // Check auto-eligibility via enrollment
      // This would require enrollment table - for now, skip auto-eligibility
      // Will be implemented when enrollment integration is added
    }

    return { tests: pendingTests };
  }

  static async getByToken(token: string, studentId: string): Promise<any> {
    const test = await PredefinedTest.findOne({
      where: { test_link_token: token, status: "active" },
    });

    if (!test) {
      throw ApiError.notFound("Test not found or inactive");
    }

    // Check schedule
    if (test.is_scheduled) {
      const now = new Date();
      if (test.start_time && now < test.start_time) {
        throw ApiError.badRequest("Test has not started yet");
      }
      if (test.end_time && now > test.end_time) {
        throw ApiError.badRequest("Test has ended");
      }
    }

    return {
      id: test.id,
      title: test.title,
      description: test.description,
      duration_minutes: test.duration_minutes,
      question_limit: test.question_limit,
      difficulty: test.difficulty,
      is_scheduled: test.is_scheduled,
      start_time: test.start_time,
      end_time: test.end_time,
    };
  }

  static async startTest(testId: string, studentId: string): Promise<any> {
    const test = await PredefinedTest.findByPk(testId);

    if (!test) {
      throw ApiError.notFound("Predefined test not found");
    }

    if (test.status !== "active") {
      throw ApiError.badRequest("Test is not active");
    }

    // Check schedule
    if (test.is_scheduled) {
      const now = new Date();
      if (test.start_time && now < test.start_time) {
        throw ApiError.badRequest("Test has not started yet");
      }
      if (test.end_time && now > test.end_time) {
        throw ApiError.badRequest("Test has ended");
      }
    }

    // Check if student is eligible (assigned or auto-eligible)
    const assignedStudent = await PredefinedTestStudent.findOne({
      where: {
        predefined_test_id: testId,
        student_id: studentId,
      },
    });

    // Check attempts
    const existingSessions = await PredefinedTestStudent.findAll({
      where: {
        predefined_test_id: testId,
        student_id: studentId,
        status: "completed",
      },
    });

    if (existingSessions.length >= test.max_attempts) {
      throw ApiError.badRequest("Maximum attempts reached");
    }

    // Get questions
    let questionIds: string[];

    if (test.use_fixed_questions) {
      // Get fixed questions
      const fixedQuestions = await PredefinedTestQuestion.findAll({
        where: { predefined_test_id: testId },
        order: [["order", "ASC"]],
      });
      questionIds = fixedQuestions.map((fq) => fq.question_id);
    } else {
      // Dynamic question selection based on filters and difficulty ratio
      const baseWhere: any = {};

      if (test.course_ids && test.course_ids.length > 0) {
        baseWhere.course_id = { [Op.in]: test.course_ids };
      }

      if (test.subject_ids && test.subject_ids.length > 0) {
        baseWhere.subject_id = { [Op.in]: test.subject_ids };
      }

      if (test.topic_ids && test.topic_ids.length > 0) {
        baseWhere.topic_id = { [Op.in]: test.topic_ids };
      }

      // Check if difficulty_ratio is set
      const hasRatio = test.difficulty_ratio && 
        Object.values(test.difficulty_ratio).some((v) => v && v > 0);

      if (hasRatio) {
        // Select questions based on difficulty ratio
        const ratio = test.difficulty_ratio!;
        const totalQuestions = test.question_limit;
        let allSelectedQuestions: string[] = [];

        for (const [difficulty, percentage] of Object.entries(ratio)) {
          if (!percentage || percentage <= 0) continue;

          const count = Math.round((percentage / 100) * totalQuestions);
          if (count <= 0) continue;

          const questions = await Question.findAll({
            where: { ...baseWhere, difficulty },
            order: sequelize.random(),
            limit: count,
          });

          allSelectedQuestions = [...allSelectedQuestions, ...questions.map((q) => q.id)];
        }

        // If we have fewer questions than requested, fill with random from any difficulty
        if (allSelectedQuestions.length < totalQuestions) {
          const remaining = totalQuestions - allSelectedQuestions.length;
          const existingIds = new Set(allSelectedQuestions);

          const additionalQuestions = await Question.findAll({
            where: {
              ...baseWhere,
              id: { [Op.notIn]: Array.from(existingIds) },
            },
            order: sequelize.random(),
            limit: remaining,
          });

          allSelectedQuestions = [...allSelectedQuestions, ...additionalQuestions.map((q) => q.id)];
        }

        questionIds = allSelectedQuestions.slice(0, totalQuestions);
      } else if (test.difficulty !== "mixed") {
        // Use single difficulty level
        const questions = await Question.findAll({
          where: { ...baseWhere, difficulty: test.difficulty },
          order: sequelize.random(),
          limit: test.question_limit,
        });
        questionIds = questions.map((q) => q.id);
      } else {
        // Mixed difficulty - random selection
        const questions = await Question.findAll({
          where: baseWhere,
          order: sequelize.random(),
          limit: test.question_limit,
        });
        questionIds = questions.map((q) => q.id);
      }
    }

    if (questionIds.length === 0) {
      throw ApiError.badRequest("No questions available for this test");
    }

    // Create test session (reuse existing TestSession model)
    const TestSession = require("../testSession/testSession.model").default;
    const TestAnswer = require("../testAnswer/testAnswer.model").default;

    const testSession = await TestSession.create({
      test_id: `PREDEFINED_${testId.slice(0, 8)}_${Date.now()}`,
      student_id: studentId,
      predefined_test_id: testId,
      status: "in_progress",
      duration_minutes: test.duration_minutes,
      question_limit: test.question_limit,
      total_questions: questionIds.length,
      ends_at: new Date(Date.now() + test.duration_minutes * 60 * 1000),
      started_at: new Date(),
    });

    // Create answer stubs
    const answerStubs = questionIds.map((questionId) => ({
      test_session_id: testSession.id,
      question_id: questionId,
      selected_answer: null,
      is_skipped: false,
      time_taken: 0,
    }));
    await TestAnswer.bulkCreate(answerStubs);

    // Update student assignment status
    if (assignedStudent) {
      await assignedStudent.update({
        status: "started",
        test_session_id: testSession.id,
      });
    } else {
      // Create assignment record
      await PredefinedTestStudent.create({
        predefined_test_id: testId,
        student_id: studentId,
        status: "started",
        test_session_id: testSession.id,
      });
    }

    // Fetch questions with details (without correct answers)
    const questions = await Question.findAll({
      where: { id: { [Op.in]: questionIds } },
      attributes: { exclude: ["correctAnswer", "explanation"] },
      include: [
        { model: Topic, as: "topic", attributes: ["id", "name"] },
        { model: Subject, as: "subject", attributes: ["id", "name"] },
        { model: Course, as: "course", attributes: ["id", "name"] },
      ],
    });

    // Order questions by the original order
    const orderedQuestions = questionIds.map((id) => questions.find((q) => q.id === id)).filter(Boolean);

    return {
      id: testSession.id,
      test_id: testSession.test_id,
      status: testSession.status,
      duration_minutes: test.duration_minutes,
      question_limit: test.question_limit,
      ends_at: testSession.ends_at,
      totalQuestions: orderedQuestions.length,
      questions: orderedQuestions.map((q, index) => {
        const question = q as any;
        return {
          index,
          questionId: question.id,
          question: question.question,
          choices: question.choices,
          difficulty: question.difficulty,
          topicName: question.topic?.name || "",
          subjectName: question.subject?.name || "",
          courseName: question.course?.name || "",
        };
      }),
    };
  }
}

// Need to import sequelize for random()
import { sequelize } from "../../config/database";
