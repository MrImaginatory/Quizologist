import { ApiError } from "../../utils/ApiError";
import { RESPONSE_MESSAGES } from "../../utils/responseMessages";
import Faculty from "./faculty.model";
import Subject from "../subject/subject.model";
import {
  CreateFacultyInput,
  UpdateFacultyInput,
  FacultyIdParam,
  GetAllFacultyInput,
} from "./faculty.validation";

const TIMESTAMP_EXCLUDE = { exclude: ["createdAt", "updatedAt", "deletedAt"] };

export class FacultyService {
  static async create(data: CreateFacultyInput) {
    const existing = await Faculty.findOne({
      where: { name: data.name.toLowerCase() },
    });

    if (existing) {
      throw ApiError.conflict(RESPONSE_MESSAGES.ERROR.FACULTY_EXISTS);
    }

    const faculty = await Faculty.create({
      name: data.name.toLowerCase(),
      description: data.description || null,
    });

    return faculty.toJSON();
  }

  static async getAll(data: GetAllFacultyInput) {
    const { page, limit } = data;
    const offset = (page - 1) * limit;

    const { rows, count } = await Faculty.findAndCountAll({
      attributes: TIMESTAMP_EXCLUDE,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return {
      faculties: rows.map((f) => f.toJSON()),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  static async getById(data: FacultyIdParam) {
    const faculty = await Faculty.findByPk(data.id, {
      attributes: TIMESTAMP_EXCLUDE,
    });

    if (!faculty) {
      throw ApiError.notFound(RESPONSE_MESSAGES.ERROR.FACULTY_NOT_FOUND);
    }

    return faculty.toJSON();
  }

  static async update(data: FacultyIdParam & UpdateFacultyInput) {
    const faculty = await Faculty.findByPk(data.id);

    if (!faculty) {
      throw ApiError.notFound(RESPONSE_MESSAGES.ERROR.FACULTY_NOT_FOUND);
    }

    if (data.name) {
      const existing = await Faculty.findOne({
        where: { name: data.name.toLowerCase() },
      });

      if (existing && existing.id !== data.id) {
        throw ApiError.conflict(RESPONSE_MESSAGES.ERROR.FACULTY_EXISTS);
      }

      faculty.set("name", data.name.toLowerCase());
    }

    if (data.description !== undefined) {
      faculty.set("description", data.description);
    }

    await faculty.save();

    const updated = await Faculty.findByPk(data.id, {
      attributes: TIMESTAMP_EXCLUDE,
    });

    return updated!.toJSON();
  }

  static async delete(data: FacultyIdParam) {
    const faculty = await Faculty.findByPk(data.id);

    if (!faculty) {
      throw ApiError.notFound(RESPONSE_MESSAGES.ERROR.FACULTY_NOT_FOUND);
    }

    const linkedSubjects = await Subject.count({
      where: { faculty_id: data.id },
    });

    if (linkedSubjects > 0) {
      throw ApiError.badRequest(RESPONSE_MESSAGES.ERROR.FACULTY_HAS_SUBJECTS);
    }

    await faculty.destroy();

    return { message: RESPONSE_MESSAGES.SUCCESS.FACULTY_DELETED };
  }
}
