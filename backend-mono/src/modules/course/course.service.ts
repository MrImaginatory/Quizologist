import { ApiError } from "../../utils/ApiError";
import { RESPONSE_MESSAGES } from "../../utils/responseMessages";
import Course from "./course.model";
import Subject from "../subject/subject.model";
import {
  CreateCourseInput,
  UpdateCourseInput,
  CourseIdParam,
  GetAllCourseInput,
} from "./course.validation";

const TIMESTAMP_EXCLUDE = { exclude: ["createdAt", "updatedAt", "deletedAt"] };

export class CourseService {
  static async create(data: CreateCourseInput) {
    const existing = await Course.findOne({
      where: { name: data.name.toLowerCase() },
    });

    if (existing) {
      throw ApiError.conflict(RESPONSE_MESSAGES.ERROR.COURSE_EXISTS);
    }

    const course = await Course.create({
      name: data.name.toLowerCase(),
      description: data.description || null,
    });

    return course.toJSON();
  }

  static async getAll(data: GetAllCourseInput) {
    const { page, limit } = data;
    const offset = (page - 1) * limit;

    const { rows, count } = await Course.findAndCountAll({
      attributes: TIMESTAMP_EXCLUDE,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return {
      courses: rows.map((c) => c.toJSON()),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  static async getById(data: CourseIdParam) {
    const course = await Course.findByPk(data.id, {
      attributes: TIMESTAMP_EXCLUDE,
    });

    if (!course) {
      throw ApiError.notFound(RESPONSE_MESSAGES.ERROR.COURSE_NOT_FOUND);
    }

    return course.toJSON();
  }

  static async update(data: CourseIdParam & UpdateCourseInput) {
    const course = await Course.findByPk(data.id);

    if (!course) {
      throw ApiError.notFound(RESPONSE_MESSAGES.ERROR.COURSE_NOT_FOUND);
    }

    if (data.name) {
      const existing = await Course.findOne({
        where: { name: data.name.toLowerCase() },
      });

      if (existing && existing.id !== data.id) {
        throw ApiError.conflict(RESPONSE_MESSAGES.ERROR.COURSE_EXISTS);
      }

      course.set("name", data.name.toLowerCase());
    }

    if (data.description !== undefined) {
      course.set("description", data.description);
    }

    await course.save();

    const updated = await Course.findByPk(data.id, {
      attributes: TIMESTAMP_EXCLUDE,
    });

    return updated!.toJSON();
  }

  static async delete(data: CourseIdParam) {
    const course = await Course.findByPk(data.id);

    if (!course) {
      throw ApiError.notFound(RESPONSE_MESSAGES.ERROR.COURSE_NOT_FOUND);
    }

    const linkedSubjects = await Subject.count({
      where: { course_id: data.id },
    });

    if (linkedSubjects > 0) {
      throw ApiError.badRequest(RESPONSE_MESSAGES.ERROR.COURSE_HAS_SUBJECTS);
    }

    await course.destroy();

    return { message: RESPONSE_MESSAGES.SUCCESS.COURSE_DELETED };
  }
}
