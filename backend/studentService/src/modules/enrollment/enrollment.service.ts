import { ApiError } from "../../utils/ApiError";
import { RESPONSE_MESSAGES } from "../../utils/responseMessages";
import Enrollment from "./enrollment.model";
import Faculty from "../faculty/faculty.model";
import Subject from "../subject/subject.model";
import Topic from "../topic/topic.model";
import {
  EnrollmentItemInput,
  CreateEnrollmentInput,
  EnrollmentIdParam,
  GetAllEnrollmentsInput,
} from "./enrollment.validation";

const TIMESTAMP_EXCLUDE = {
  exclude: ["faculty_id", "subject_id", "topic_id", "createdAt", "updatedAt", "deletedAt"],
};

const FACULTY_INCLUDE = { model: Faculty, as: "faculty", attributes: ["id", "name"] };
const SUBJECT_INCLUDE = { model: Subject, as: "subject", attributes: ["id", "name"] };
const TOPIC_INCLUDE = { model: Topic, as: "topic", attributes: ["id", "name"] };
const ALL_INCLUDES = [FACULTY_INCLUDE, SUBJECT_INCLUDE, TOPIC_INCLUDE];

async function validateEnrollmentItem(data: EnrollmentItemInput) {
  const faculty = await Faculty.findByPk(data.faculty_id);
  if (!faculty) throw ApiError.badRequest(RESPONSE_MESSAGES.ERROR.FACULTY_NOT_FOUND);

  if (data.subject_id) {
    const subject = await Subject.findByPk(data.subject_id);
    if (!subject) throw ApiError.badRequest(RESPONSE_MESSAGES.ERROR.SUBJECT_NOT_FOUND);

    if (subject.faculty_id !== data.faculty_id) {
      throw ApiError.badRequest(RESPONSE_MESSAGES.ERROR.SUBJECT_FACULTY_MISMATCH);
    }
  }

  if (data.topic_id) {
    const topic = await Topic.findByPk(data.topic_id);
    if (!topic) throw ApiError.badRequest(RESPONSE_MESSAGES.ERROR.TOPIC_NOT_FOUND);

    if (!data.subject_id) {
      throw ApiError.badRequest("subject_id is required when topic_id is provided");
    }

    if (topic.subject_id !== data.subject_id) {
      throw ApiError.badRequest(RESPONSE_MESSAGES.ERROR.TOPIC_SUBJECT_MISMATCH);
    }
  }
}

async function checkDuplicate(studentId: string, data: EnrollmentItemInput) {
  const existing = await Enrollment.findOne({
    where: {
      student_id: studentId,
      faculty_id: data.faculty_id,
      subject_id: data.subject_id || null,
      topic_id: data.topic_id || null,
    },
  });

  return existing !== null;
}

export class EnrollmentService {
  static async createBatch(data: CreateEnrollmentInput, studentId: string) {
    const created: any[] = [];
    const skipped: { enrollment: EnrollmentItemInput; reason: string }[] = [];

    for (const item of data.enrollments) {
      const isDuplicate = await checkDuplicate(studentId, item);

      if (isDuplicate) {
        skipped.push({ enrollment: item, reason: "Already enrolled" });
        continue;
      }

      await validateEnrollmentItem(item);

      const enrollment = await Enrollment.create({
        student_id: studentId,
        faculty_id: item.faculty_id,
        subject_id: item.subject_id || null,
        topic_id: item.topic_id || null,
      });

      const result = await Enrollment.findByPk(enrollment.id, {
        attributes: TIMESTAMP_EXCLUDE,
        include: ALL_INCLUDES,
      });

      created.push(result!.toJSON());
    }

    return { created, skipped, totalCreated: created.length, totalSkipped: skipped.length };
  }

  static async getAll(studentId: string, data: GetAllEnrollmentsInput) {
    const { page, limit } = data;
    const offset = (page - 1) * limit;

    const { rows, count } = await Enrollment.findAndCountAll({
      where: { student_id: studentId },
      attributes: TIMESTAMP_EXCLUDE,
      include: ALL_INCLUDES,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return {
      enrollments: rows.map((e) => e.toJSON()),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  static async getById(data: EnrollmentIdParam, studentId: string) {
    const enrollment = await Enrollment.findOne({
      where: { id: data.id, student_id: studentId },
      attributes: TIMESTAMP_EXCLUDE,
      include: ALL_INCLUDES,
    });

    if (!enrollment) {
      throw ApiError.notFound(RESPONSE_MESSAGES.ERROR.ENROLLMENT_NOT_FOUND);
    }

    return enrollment.toJSON();
  }

  static async delete(data: EnrollmentIdParam, studentId: string) {
    const enrollment = await Enrollment.findOne({
      where: { id: data.id, student_id: studentId },
    });

    if (!enrollment) {
      throw ApiError.notFound(RESPONSE_MESSAGES.ERROR.ENROLLMENT_NOT_FOUND);
    }

    await enrollment.destroy();

    return { message: RESPONSE_MESSAGES.SUCCESS.UNENROLLED };
  }

  static async getByStudentId(studentId: string, data: GetAllEnrollmentsInput) {
    const { page, limit } = data;
    const offset = (page - 1) * limit;

    const { rows, count } = await Enrollment.findAndCountAll({
      where: { student_id: studentId },
      attributes: TIMESTAMP_EXCLUDE,
      include: ALL_INCLUDES,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return {
      enrollments: rows.map((e) => e.toJSON()),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }
}
