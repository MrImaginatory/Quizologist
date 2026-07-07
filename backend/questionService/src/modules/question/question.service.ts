import { Op } from "sequelize";
import { ApiError } from "../../utils/ApiError";
import { RESPONSE_MESSAGES } from "../../utils/responseMessages";
import Question from "./question.model";
import {
  CreateQuestionInput,
  UpdateQuestionInput,
  QuestionIdParam,
  SearchQuestionsInput,
  GetQuestionsByTopicInput,
  GetAllQuestionsInput,
} from "./question.validation";

const TIMESTAMP_EXCLUDE = { exclude: ["createdAt", "updatedAt", "deletedAt"] };

export class QuestionService {
  static async create(data: CreateQuestionInput, userId: string) {
    const question = await Question.create({
      type: data.type,
      question: data.question,
      choices: data.type === "mcq" ? data.choices! : null,
      correctAnswer: data.correctAnswer,
      explanation: data.explanation || null,
      videoUrl: data.videoUrl || null,
      topic_id: data.topic_id,
      subject_id: data.subject_id,
      faculty_id: data.faculty_id,
      questionAddedBy: userId,
    });

    return question.toJSON();
  }

  static async getAll(data: GetAllQuestionsInput) {
    const { page, limit } = data;
    const offset = (page - 1) * limit;

    const { rows, count } = await Question.findAndCountAll({
      attributes: TIMESTAMP_EXCLUDE,
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

    if (data.type) question.set("type", data.type);
    if (data.question) question.set("question", data.question);
    if (data.choices !== undefined) question.set("choices", data.choices);
    if (data.correctAnswer) question.set("correctAnswer", data.correctAnswer);
    if (data.explanation !== undefined) question.set("explanation", data.explanation);
    if (data.videoUrl !== undefined) question.set("videoUrl", data.videoUrl);
    if (data.topic_id) question.set("topic_id", data.topic_id);
    if (data.subject_id) question.set("subject_id", data.subject_id);
    if (data.faculty_id) question.set("faculty_id", data.faculty_id);

    await question.save();

    const updated = await Question.findByPk(data.id, {
      attributes: TIMESTAMP_EXCLUDE,
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
