import { ApiError } from "../../utils/ApiError";
import { RESPONSE_MESSAGES } from "../../utils/responseMessages";
import Course from "../course/course.model";
import Subject from "./subject.model";
import Topic from "../topic/topic.model";
import {
  CreateSubjectInput,
  UpdateSubjectInput,
  SubjectIdParam,
  GetSubjectsByCourseInput,
  GetAllSubjectsInput,
} from "./subject.validation";

const TIMESTAMP_EXCLUDE = { exclude: ["createdAt", "updatedAt", "deletedAt"] };
const COURSE_INCLUDE = { model: Course, as: "course", attributes: ["id", "name"] };

export class SubjectService {
  static async create(data: CreateSubjectInput) {
    const course = await Course.findByPk(data.course_id);
    if (!course) {
      throw ApiError.notFound(RESPONSE_MESSAGES.ERROR.COURSE_NOT_FOUND);
    }

    const existing = await Subject.findOne({
      where: { name: data.name.toLowerCase(), course_id: data.course_id },
    });

    if (existing) {
      throw ApiError.conflict(RESPONSE_MESSAGES.ERROR.SUBJECT_EXISTS);
    }

    const subject = await Subject.create({
      name: data.name.toLowerCase(),
      description: data.description || null,
      course_id: data.course_id,
    });

    const created = await Subject.findByPk(subject.id, {
      attributes: TIMESTAMP_EXCLUDE,
      include: [COURSE_INCLUDE],
    });

    return created!.toJSON();
  }

  static async getAll(data: GetAllSubjectsInput) {
    const { page, limit } = data;
    const offset = (page - 1) * limit;

    const { rows, count } = await Subject.findAndCountAll({
      attributes: TIMESTAMP_EXCLUDE,
      include: [COURSE_INCLUDE],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return {
      subjects: rows.map((s) => s.toJSON()),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  static async getByCourseId(data: GetSubjectsByCourseInput) {
    const course = await Course.findByPk(data.courseId);
    if (!course) {
      throw ApiError.notFound(RESPONSE_MESSAGES.ERROR.COURSE_NOT_FOUND);
    }

    const { page, limit } = data;
    const offset = (page - 1) * limit;

    const { rows, count } = await Subject.findAndCountAll({
      where: { course_id: data.courseId },
      attributes: TIMESTAMP_EXCLUDE,
      include: [COURSE_INCLUDE],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return {
      subjects: rows.map((s) => s.toJSON()),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  static async getById(data: SubjectIdParam) {
    const subject = await Subject.findByPk(data.id, {
      attributes: TIMESTAMP_EXCLUDE,
      include: [COURSE_INCLUDE],
    });

    if (!subject) {
      throw ApiError.notFound(RESPONSE_MESSAGES.ERROR.SUBJECT_NOT_FOUND);
    }

    return subject.toJSON();
  }

  static async update(data: SubjectIdParam & UpdateSubjectInput) {
    const subject = await Subject.findByPk(data.id);

    if (!subject) {
      throw ApiError.notFound(RESPONSE_MESSAGES.ERROR.SUBJECT_NOT_FOUND);
    }

    if (data.course_id) {
      const course = await Course.findByPk(data.course_id);
      if (!course) {
        throw ApiError.notFound(RESPONSE_MESSAGES.ERROR.COURSE_NOT_FOUND);
      }
      subject.set("course_id", data.course_id);
    }

    if (data.name) {
      const targetCourseId = data.course_id || subject.course_id;
      const existing = await Subject.findOne({
        where: { name: data.name.toLowerCase(), course_id: targetCourseId },
      });

      if (existing && existing.id !== data.id) {
        throw ApiError.conflict(RESPONSE_MESSAGES.ERROR.SUBJECT_EXISTS);
      }

      subject.set("name", data.name.toLowerCase());
    }

    if (data.description !== undefined) {
      subject.set("description", data.description);
    }

    await subject.save();

    const updated = await Subject.findByPk(data.id, {
      attributes: TIMESTAMP_EXCLUDE,
      include: [COURSE_INCLUDE],
    });

    return updated!.toJSON();
  }

  static async delete(data: SubjectIdParam) {
    const subject = await Subject.findByPk(data.id);

    if (!subject) {
      throw ApiError.notFound(RESPONSE_MESSAGES.ERROR.SUBJECT_NOT_FOUND);
    }

    const linkedTopics = await Topic.count({
      where: { subject_id: data.id },
    });

    if (linkedTopics > 0) {
      throw ApiError.badRequest(RESPONSE_MESSAGES.ERROR.SUBJECT_HAS_TOPICS);
    }

    await subject.destroy();

    return { message: RESPONSE_MESSAGES.SUCCESS.SUBJECT_DELETED };
  }
}
