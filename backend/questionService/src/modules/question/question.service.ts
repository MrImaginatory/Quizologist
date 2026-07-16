import { Op } from "sequelize";
import { ApiError } from "../../utils/ApiError";
import { RESPONSE_MESSAGES } from "../../utils/responseMessages";
import Question from "./question.model";
import Topic from "../topic/topic.model";
import Subject from "../subject/subject.model";
import Course from "../course/course.model";
import TeacherAssignment from "../teacherAssignment/teacherAssignment.model";
import {
  CreateQuestionInput,
  UpdateQuestionInput,
  QuestionIdParam,
  SearchQuestionsInput,
  GetQuestionsByTopicInput,
  GetAllQuestionsInput,
  FilterQuestionsInput,
} from "./question.validation";

const TIMESTAMP_EXCLUDE = { exclude: ["createdAt", "updatedAt", "deletedAt"] };

const TOPIC_INCLUDE = { model: Topic, as: "topic", attributes: ["id", "name"] };
const SUBJECT_INCLUDE = { model: Subject, as: "subject", attributes: ["id", "name"] };
const COURSE_INCLUDE = { model: Course, as: "course", attributes: ["id", "name"] };
const ALL_INCLUDES = [TOPIC_INCLUDE, SUBJECT_INCLUDE, COURSE_INCLUDE];

async function validateForeignKeys(data: { topic_id: string; subject_id: string; course_id: string }) {
  const topic = await Topic.findByPk(data.topic_id);
  if (!topic) throw ApiError.badRequest(RESPONSE_MESSAGES.ERROR.TOPIC_NOT_FOUND);

  const subject = await Subject.findByPk(data.subject_id);
  if (!subject) throw ApiError.badRequest(RESPONSE_MESSAGES.ERROR.SUBJECT_NOT_FOUND);

  const course = await Course.findByPk(data.course_id);
  if (!course) throw ApiError.badRequest(RESPONSE_MESSAGES.ERROR.COURSE_NOT_FOUND);
}

async function checkDuplicateQuestion(questionText: string, topicId: string) {
  const existing = await Question.findOne({
    where: {
      question: questionText,
      topic_id: topicId,
    },
  });

  if (existing) {
    throw ApiError.conflict(RESPONSE_MESSAGES.ERROR.QUESTION_EXISTS);
  }
}

export class QuestionService {
  static async create(data: CreateQuestionInput, userId: string) {
    await validateForeignKeys(data);
    await checkDuplicateQuestion(data.question, data.topic_id);

    const question = await Question.create({
      type: data.type,
      question: data.question,
      choices: data.type === "mcq" ? data.choices! : null,
      correctAnswer: data.correctAnswer,
      explanation: data.explanation || null,
      videoUrl: data.videoUrl || null,
      difficulty: data.difficulty,
      topic_id: data.topic_id,
      subject_id: data.subject_id,
      course_id: data.course_id,
      questionAddedBy: userId,
    });

    const created = await Question.findByPk(question.id, {
      attributes: TIMESTAMP_EXCLUDE,
      include: ALL_INCLUDES,
    });

    return created!.toJSON();
  }

  static async getAll(data: GetAllQuestionsInput, user?: { userId: string; role: string }) {
    const { page, limit } = data;
    const offset = (page - 1) * limit;

    const where: any = {};

    // If teacher, filter by their assigned courses/subjects
    if (user && user.role === "teacher") {
      const assignments = await TeacherAssignment.findAll({
        where: { teacher_id: user.userId },
        attributes: ["course_id", "subject_id"],
        raw: true,
      });

      if (assignments.length === 0) {
        return {
          questions: [],
          pagination: { total: 0, page, limit, totalPages: 0 },
        };
      }

      const courseIds = [...new Set(assignments.map((a) => a.course_id))];
      const subjectIds = assignments
        .filter((a) => a.subject_id)
        .map((a) => a.subject_id);

      // If teacher has subject-specific assignments, filter by those
      // Otherwise, filter by course only
      if (subjectIds.length > 0) {
        where[Op.or] = [
          { course_id: { [Op.in]: courseIds }, subject_id: { [Op.in]: subjectIds } },
          { course_id: { [Op.in]: courseIds }, subject_id: null },
        ];
      } else {
        where.course_id = { [Op.in]: courseIds };
      }
    }

    const { rows, count } = await Question.findAndCountAll({
      where,
      attributes: TIMESTAMP_EXCLUDE,
      include: ALL_INCLUDES,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return {
      questions: rows.map((q) => q.toJSON()),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  static async getById(data: QuestionIdParam) {
    const question = await Question.findByPk(data.id, {
      attributes: TIMESTAMP_EXCLUDE,
      include: ALL_INCLUDES,
    });

    if (!question) {
      throw ApiError.notFound(RESPONSE_MESSAGES.ERROR.QUESTION_NOT_FOUND);
    }

    return question.toJSON();
  }

  static async search(data: SearchQuestionsInput) {
    const { q, page, limit } = data;
    const offset = (page - 1) * limit;

    const { rows, count } = await Question.findAndCountAll({
      where: {
        question: { [Op.iLike]: `%${q}%` },
      },
      attributes: TIMESTAMP_EXCLUDE,
      include: ALL_INCLUDES,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return {
      questions: rows.map((q) => q.toJSON()),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  static async getByTopicId(data: GetQuestionsByTopicInput) {
    const { topicId, page, limit } = data;
    const offset = (page - 1) * limit;

    const { rows, count } = await Question.findAndCountAll({
      where: { topic_id: topicId },
      attributes: TIMESTAMP_EXCLUDE,
      include: ALL_INCLUDES,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return {
      questions: rows.map((q) => q.toJSON()),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  static async filter(data: FilterQuestionsInput, user?: { userId: string; role: string }) {
    const { course_id, subject_id, topic_id, page, limit } = data;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (course_id) where.course_id = course_id;
    if (subject_id) where.subject_id = subject_id;
    if (topic_id) where.topic_id = topic_id;

    // If teacher, filter by their assigned courses/subjects
    if (user && user.role === "teacher") {
      const assignments = await TeacherAssignment.findAll({
        where: { teacher_id: user.userId },
        attributes: ["course_id", "subject_id"],
        raw: true,
      });

      if (assignments.length === 0) {
        return {
          questions: [],
          pagination: { total: 0, page, limit, totalPages: 0 },
        };
      }

      const courseIds = [...new Set(assignments.map((a) => a.course_id))];
      const subjectIds = assignments
        .filter((a) => a.subject_id)
        .map((a) => a.subject_id);

      // If teacher has subject-specific assignments, filter by those
      // Otherwise, filter by course only
      if (subjectIds.length > 0) {
        where[Op.or] = [
          { course_id: { [Op.in]: courseIds }, subject_id: { [Op.in]: subjectIds } },
          { course_id: { [Op.in]: courseIds }, subject_id: null },
        ];
      } else {
        where.course_id = { [Op.in]: courseIds };
      }
    }

    const { rows, count } = await Question.findAndCountAll({
      where,
      attributes: TIMESTAMP_EXCLUDE,
      include: ALL_INCLUDES,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return {
      questions: rows.map((q) => q.toJSON()),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  static async update(data: QuestionIdParam & UpdateQuestionInput) {
    const question = await Question.findByPk(data.id);

    if (!question) {
      throw ApiError.notFound(RESPONSE_MESSAGES.ERROR.QUESTION_NOT_FOUND);
    }

    if (data.topic_id || data.subject_id || data.course_id) {
      await validateForeignKeys({
        topic_id: data.topic_id || question.topic_id,
        subject_id: data.subject_id || question.subject_id,
        course_id: data.course_id || question.course_id,
      });
    }

    if (data.question && data.question !== question.question) {
      await checkDuplicateQuestion(data.question, data.topic_id || question.topic_id);
    }

    if (data.type) question.set("type", data.type);
    if (data.question) question.set("question", data.question);
    if (data.choices !== undefined) question.set("choices", data.choices);
    if (data.correctAnswer) question.set("correctAnswer", data.correctAnswer);
    if (data.explanation !== undefined) question.set("explanation", data.explanation);
    if (data.videoUrl !== undefined) question.set("videoUrl", data.videoUrl);
    if (data.difficulty) question.set("difficulty", data.difficulty);
    if (data.topic_id) question.set("topic_id", data.topic_id);
    if (data.subject_id) question.set("subject_id", data.subject_id);
    if (data.course_id) question.set("course_id", data.course_id);

    await question.save();

    const updated = await Question.findByPk(data.id, {
      attributes: TIMESTAMP_EXCLUDE,
      include: ALL_INCLUDES,
    });

    return updated!.toJSON();
  }

  static async delete(data: QuestionIdParam) {
    const question = await Question.findByPk(data.id);

    if (!question) {
      throw ApiError.notFound(RESPONSE_MESSAGES.ERROR.QUESTION_NOT_FOUND);
    }

    await question.destroy();

    return { message: RESPONSE_MESSAGES.SUCCESS.QUESTION_DELETED };
  }
}
