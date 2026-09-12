import { Op } from "sequelize";
import PredefinedTest from "../predefinedTest/predefinedTest.model";
import PredefinedTestQuestion from "../predefinedTest/predefinedTestQuestion.model";
import PredefinedTestStudent from "../predefinedTest/predefinedTestStudent.model";
import TestSession from "../testSession/testSession.model";
import Question from "../question/question.model";
import Enrollment from "../enrollment/enrollment.model";
import { sequelize } from "../../config/database";
import { PredefinedTestService } from "../predefinedTest/predefinedTest.service";
import { ApiError } from "../../utils/ApiError";

export class PreAssessmentService {
  static async getStatus(studentId: string) {
    // Check if the student has completed any pre-assessment test
    const completedSession = await TestSession.findOne({
      where: {
        student_id: studentId,
        status: "completed",
      },
      include: [
        {
          model: PredefinedTest,
          as: "predefinedTest",
          where: { is_pre_assessment: true },
          required: true,
        },
      ],
    });

    if (completedSession) {
      return { required: false, completed: true };
    }

    // Check if there is an in-progress session
    const inProgressSession = await TestSession.findOne({
      where: {
        student_id: studentId,
        status: "in_progress",
      },
      include: [
        {
          model: PredefinedTest,
          as: "predefinedTest",
          where: { is_pre_assessment: true },
          required: true,
        },
      ],
    });

    if (inProgressSession) {
      return { 
        required: true, 
        completed: false, 
        sessionId: inProgressSession.id, 
        predefinedTestId: inProgressSession.predefined_test_id 
      };
    }

    return { required: true, completed: false };
  }

  static async start(studentId: string) {
    const status = await this.getStatus(studentId);
    
    if (status.completed) {
      throw ApiError.badRequest("Pre-assessment already completed");
    }

    if (status.sessionId) {
      throw ApiError.conflict("You already have an active pre-assessment in progress. Please resume it.");
    }

    // Generate a new pre-assessment
    const predefinedTestId = await this.generateForStudent(studentId);

    // Start the predefined test session
    const result = await PredefinedTestService.startTest(predefinedTestId, studentId);
    return result;
  }

  private static async generateForStudent(studentId: string): Promise<string> {
    // 1. Get student's enrolled courses
    const enrollments = await Enrollment.findAll({
      where: { student_id: studentId },
    });

    if (!enrollments || enrollments.length === 0) {
      throw ApiError.badRequest("You are not enrolled in any courses to take a pre-assessment.");
    }

    const courseIds = enrollments.map(e => e.course_id);

    // 2. Fetch questions from these courses
    const targetQuestionCount = 45;
    
    const questions = await Question.findAll({
      where: {
        course_id: { [Op.in]: courseIds },
      },
      order: sequelize.random(),
      limit: targetQuestionCount,
    });

    if (questions.length === 0) {
      throw ApiError.badRequest("No questions available in your enrolled courses for the pre-assessment.");
    }

    const actualQuestionCount = questions.length;

    // 3. Create the predefined test
    const testTitle = `Pre-Assessment - ${new Date().toISOString().split('T')[0]}`;
    
    const test = await PredefinedTest.create({
      title: testTitle,
      description: "Auto-generated pre-assessment based on your enrolled courses.",
      created_by: studentId, // System-generated but tied to the student
      status: "active",
      is_scheduled: false,
      start_time: null,
      end_time: null,
      timezone: "UTC",
      duration_minutes: 60, // e.g. 60 mins
      question_limit: actualQuestionCount,
      difficulty: "mixed",
      is_pre_assessment: true,
      use_fixed_questions: true,
      use_specific_students: true,
      max_attempts: 1,
      course_ids: courseIds,
      subject_ids: null,
      topic_ids: null,
      test_link_token: null,
    });

    // 4. Link questions
    const questionRecords = questions.map((q, index) => ({
      predefined_test_id: test.id,
      question_id: q.id,
      order: index + 1,
    }));
    await PredefinedTestQuestion.bulkCreate(questionRecords);

    // 5. Assign student
    await PredefinedTestStudent.create({
      predefined_test_id: test.id,
      student_id: studentId,
      status: "assigned",
    });

    return test.id;
  }
}
