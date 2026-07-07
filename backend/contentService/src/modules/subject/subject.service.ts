import { ApiError } from "../../utils/ApiError";
import { RESPONSE_MESSAGES } from "../../utils/responseMessages";
import Faculty from "../faculty/faculty.model";
import Subject from "./subject.model";
import {
  CreateSubjectInput,
  UpdateSubjectInput,
  SubjectIdParam,
  GetSubjectsByFacultyInput,
  GetAllSubjectsInput,
} from "./subject.validation";

const TIMESTAMP_EXCLUDE = { exclude: ["createdAt", "updatedAt", "deletedAt"] };
const FACULTY_INCLUDE = { model: Faculty, as: "faculty", attributes: ["id", "name"] };

export class SubjectService {
  static async create(data: CreateSubjectInput) {
    const faculty = await Faculty.findByPk(data.faculty_id);
    if (!faculty) {
      throw ApiError.notFound(RESPONSE_MESSAGES.ERROR.FACULTY_NOT_FOUND);
    }

    const existing = await Subject.findOne({
      where: { name: data.name.toLowerCase(), faculty_id: data.faculty_id },
    });

    if (existing) {
      throw ApiError.conflict(RESPONSE_MESSAGES.ERROR.SUBJECT_EXISTS);
    }

    const subject = await Subject.create({
      name: data.name.toLowerCase(),
      description: data.description || null,
      faculty_id: data.faculty_id,
    });

    return subject.toJSON();
  }

  static async getAll(data: GetAllSubjectsInput) {
    const { page, limit } = data;
    const offset = (page - 1) * limit;

    const { rows, count } = await Subject.findAndCountAll({
      attributes: TIMESTAMP_EXCLUDE,
      include: [FACULTY_INCLUDE],
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

  static async getByFacultyId(data: GetSubjectsByFacultyInput) {
    const faculty = await Faculty.findByPk(data.facultyId);
    if (!faculty) {
      throw ApiError.notFound(RESPONSE_MESSAGES.ERROR.FACULTY_NOT_FOUND);
    }

    const { page, limit } = data;
    const offset = (page - 1) * limit;

    const { rows, count } = await Subject.findAndCountAll({
      where: { faculty_id: data.facultyId },
      attributes: TIMESTAMP_EXCLUDE,
      include: [FACULTY_INCLUDE],
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
      include: [FACULTY_INCLUDE],
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

    if (data.faculty_id) {
      const faculty = await Faculty.findByPk(data.faculty_id);
      if (!faculty) {
        throw ApiError.notFound(RESPONSE_MESSAGES.ERROR.FACULTY_NOT_FOUND);
      }
      subject.set("faculty_id", data.faculty_id);
    }

    if (data.name) {
      const targetFacultyId = data.faculty_id || subject.faculty_id;
      const existing = await Subject.findOne({
        where: { name: data.name.toLowerCase(), faculty_id: targetFacultyId },
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
      include: [FACULTY_INCLUDE],
    });

    return updated!.toJSON();
  }

  static async delete(data: SubjectIdParam) {
    const subject = await Subject.findByPk(data.id);

    if (!subject) {
      throw ApiError.notFound(RESPONSE_MESSAGES.ERROR.SUBJECT_NOT_FOUND);
    }

    await subject.destroy();

    return { message: RESPONSE_MESSAGES.SUCCESS.SUBJECT_DELETED };
  }
}
