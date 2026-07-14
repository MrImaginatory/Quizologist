import { ApiError } from "../../utils/ApiError";
import { RESPONSE_MESSAGES } from "../../utils/responseMessages";
import Subject from "../subject/subject.model";
import Course from "../course/course.model";
import Topic from "./topic.model";
import Question from "../question/question.model";
import {
  CreateTopicInput,
  UpdateTopicInput,
  TopicIdParam,
  GetTopicsBySubjectInput,
  GetAllTopicsInput,
} from "./topic.validation";

const TIMESTAMP_EXCLUDE = { exclude: ["createdAt", "updatedAt", "deletedAt"] };
const SUBJECT_INCLUDE = {
  model: Subject,
  as: "subject",
  attributes: ["id", "name"],
  include: [{ model: Course, as: "course", attributes: ["id", "name"] }],
};

export class TopicService {
  static async create(data: CreateTopicInput) {
    const subject = await Subject.findByPk(data.subject_id);
    if (!subject) {
      throw ApiError.notFound(RESPONSE_MESSAGES.ERROR.SUBJECT_NOT_FOUND);
    }

    const existing = await Topic.findOne({
      where: { name: data.name.toLowerCase(), subject_id: data.subject_id },
    });

    if (existing) {
      throw ApiError.conflict(RESPONSE_MESSAGES.ERROR.TOPIC_EXISTS);
    }

    const topic = await Topic.create({
      name: data.name.toLowerCase(),
      description: data.description || null,
      subject_id: data.subject_id,
    });

    const created = await Topic.findByPk(topic.id, {
      attributes: TIMESTAMP_EXCLUDE,
      include: [SUBJECT_INCLUDE],
    });

    return created!.toJSON();
  }

  static async getAll(data: GetAllTopicsInput) {
    const { page, limit } = data;
    const offset = (page - 1) * limit;

    const { rows, count } = await Topic.findAndCountAll({
      attributes: TIMESTAMP_EXCLUDE,
      include: [SUBJECT_INCLUDE],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return {
      topics: rows.map((t) => t.toJSON()),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  static async getBySubjectId(data: GetTopicsBySubjectInput) {
    const subject = await Subject.findByPk(data.subjectId);
    if (!subject) {
      throw ApiError.notFound(RESPONSE_MESSAGES.ERROR.SUBJECT_NOT_FOUND);
    }

    const { page, limit } = data;
    const offset = (page - 1) * limit;

    const { rows, count } = await Topic.findAndCountAll({
      where: { subject_id: data.subjectId },
      attributes: TIMESTAMP_EXCLUDE,
      include: [SUBJECT_INCLUDE],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return {
      topics: rows.map((t) => t.toJSON()),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  static async getById(data: TopicIdParam) {
    const topic = await Topic.findByPk(data.id, {
      attributes: TIMESTAMP_EXCLUDE,
      include: [SUBJECT_INCLUDE],
    });

    if (!topic) {
      throw ApiError.notFound(RESPONSE_MESSAGES.ERROR.TOPIC_NOT_FOUND);
    }

    return topic.toJSON();
  }

  static async update(data: TopicIdParam & UpdateTopicInput) {
    const topic = await Topic.findByPk(data.id);

    if (!topic) {
      throw ApiError.notFound(RESPONSE_MESSAGES.ERROR.TOPIC_NOT_FOUND);
    }

    if (data.subject_id) {
      const subject = await Subject.findByPk(data.subject_id);
      if (!subject) {
        throw ApiError.notFound(RESPONSE_MESSAGES.ERROR.SUBJECT_NOT_FOUND);
      }
      topic.set("subject_id", data.subject_id);
    }

    if (data.name) {
      const targetSubjectId = data.subject_id || topic.subject_id;
      const existing = await Topic.findOne({
        where: { name: data.name.toLowerCase(), subject_id: targetSubjectId },
      });

      if (existing && existing.id !== data.id) {
        throw ApiError.conflict(RESPONSE_MESSAGES.ERROR.TOPIC_EXISTS);
      }

      topic.set("name", data.name.toLowerCase());
    }

    if (data.description !== undefined) {
      topic.set("description", data.description);
    }

    await topic.save();

    const updated = await Topic.findByPk(data.id, {
      attributes: TIMESTAMP_EXCLUDE,
      include: [SUBJECT_INCLUDE],
    });

    return updated!.toJSON();
  }

  static async delete(data: TopicIdParam) {
    const topic = await Topic.findByPk(data.id);

    if (!topic) {
      throw ApiError.notFound(RESPONSE_MESSAGES.ERROR.TOPIC_NOT_FOUND);
    }

    const linkedQuestions = await Question.count({
      where: { topic_id: data.id },
    });

    if (linkedQuestions > 0) {
      throw ApiError.badRequest(RESPONSE_MESSAGES.ERROR.TOPIC_HAS_QUESTIONS);
    }

    await topic.destroy();

    return { message: RESPONSE_MESSAGES.SUCCESS.TOPIC_DELETED };
  }
}
