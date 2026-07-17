import { ApiError } from "../../utils/ApiError";
import { RESPONSE_MESSAGES } from "../../utils/responseMessages";
import Enrollment from "./enrollment.model";
import Course from "../course/course.model";
import Subject from "../subject/subject.model";
import Topic from "../topic/topic.model";
import {
  EnrollmentItemInput,
  CreateEnrollmentInput,
  EnrollmentIdParam,
  GetAllEnrollmentsInput,
  GetEnrolledSubjectsInput,
  GetEnrolledTopicsInput,
} from "./enrollment.validation";

const TIMESTAMP_EXCLUDE = {
  exclude: ["course_id", "subject_id", "topic_id", "createdAt", "updatedAt", "deletedAt"],
};

const COURSE_INCLUDE = { model: Course, as: "course", attributes: ["id", "name"] };
const SUBJECT_INCLUDE = { model: Subject, as: "subject", attributes: ["id", "name"] };
const TOPIC_INCLUDE = { model: Topic, as: "topic", attributes: ["id", "name"] };
const ALL_INCLUDES = [COURSE_INCLUDE, SUBJECT_INCLUDE, TOPIC_INCLUDE];

function enrichEnrollment(enrollment: any) {
  const plain = enrollment.toJSON ? enrollment.toJSON() : enrollment;

  // If subject is null, it means all subjects are selected
  if (!plain.subject && plain.course) {
    plain.subject = { id: null, name: "All Subjects", _all: true };
  }

  // If topic is null but subject exists, all topics are selected
  if (!plain.topic && plain.subject && !plain.subject._all) {
    plain.topic = { id: null, name: "All Topics", _all: true };
  }

  // If topic is null and subject is all, topic is also all
  if (!plain.topic && plain.subject && plain.subject._all) {
    plain.topic = { id: null, name: "All Topics", _all: true };
  }

  return plain;
}

async function validateEnrollmentItem(data: EnrollmentItemInput) {
  const course = await Course.findByPk(data.course_id);
  if (!course) throw ApiError.badRequest(RESPONSE_MESSAGES.ERROR.COURSE_NOT_FOUND);

  if (data.subject_id) {
    const subject = await Subject.findByPk(data.subject_id);
    if (!subject) throw ApiError.badRequest(RESPONSE_MESSAGES.ERROR.SUBJECT_NOT_FOUND);

    if (subject.course_id !== data.course_id) {
      throw ApiError.badRequest(RESPONSE_MESSAGES.ERROR.SUBJECT_COURSE_MISMATCH);
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
      course_id: data.course_id,
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
        course_id: item.course_id,
        subject_id: item.subject_id || null,
        topic_id: item.topic_id || null,
      });

      const result = await Enrollment.findByPk(enrollment.id, {
        attributes: TIMESTAMP_EXCLUDE,
        include: ALL_INCLUDES,
      });

      created.push(enrichEnrollment(result!));
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
      enrollments: rows.map((e) => enrichEnrollment(e)),
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

    return enrichEnrollment(enrollment);
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
      enrollments: rows.map((e) => enrichEnrollment(e)),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  static async getEnrolledCourses(studentId: string) {
    const enrollments = await Enrollment.findAll({
      where: { student_id: studentId },
      attributes: ["course_id"],
      include: [{ model: Course, as: "course", attributes: ["id", "name"] }],
      group: ["course_id", "course.id", "course.name"],
      raw: true,
      nest: true,
    });

    const courses = enrollments
      .map((e: any) => e.course)
      .filter((c: any) => c && c.id);

    // Deduplicate by id
    const uniqueCourses = Array.from(
      new Map(courses.map((c: any) => [c.id, c])).values()
    );

    return { courses: uniqueCourses };
  }

  static async getEnrolledSubjects(studentId: string, data: GetEnrolledSubjectsInput) {
    const { course_id } = data;

    const enrollments = await Enrollment.findAll({
      where: { student_id: studentId, course_id },
      attributes: ["subject_id"],
      raw: true,
    });

    // Check if any enrollment has null subject_id (means all subjects)
    const hasAllSubjects = enrollments.some((e) => !e.subject_id);

    if (hasAllSubjects) {
      // Return all subjects for the course
      const allSubjects = await Subject.findAll({
        where: { course_id },
        attributes: ["id", "name"],
        raw: true,
      });
      return { subjects: allSubjects };
    }

    // Return only enrolled subjects
    const subjectIds = enrollments
      .map((e) => e.subject_id)
      .filter((id): id is string => id !== null);

    if (subjectIds.length === 0) {
      return { subjects: [] };
    }

    const subjects = await Subject.findAll({
      where: { id: subjectIds },
      attributes: ["id", "name"],
      raw: true,
    });

    return { subjects };
  }

  static async getEnrolledTopics(studentId: string, data: GetEnrolledTopicsInput) {
    const { course_id, subject_id } = data;

    const enrollments = await Enrollment.findAll({
      where: { student_id: studentId, course_id },
      attributes: ["subject_id", "topic_id"],
      raw: true,
    });

    // Find enrollment for this specific subject
    const subjectEnrollment = enrollments.find(
      (e) => e.subject_id === subject_id
    );

    // Also check if there's a course-level enrollment (subject_id = null)
    const hasAllSubjects = enrollments.some((e) => !e.subject_id);

    if (!subjectEnrollment && !hasAllSubjects) {
      return { topics: [] };
    }

    // Check if enrollment has null topic_id (means all topics)
    const hasAllTopics = subjectEnrollment && !subjectEnrollment.topic_id;

    if (hasAllTopics || hasAllSubjects) {
      // Return all topics for the subject
      const allTopics = await Topic.findAll({
        where: { subject_id },
        attributes: ["id", "name"],
        raw: true,
      });
      return { topics: allTopics };
    }

    // Return only enrolled topics
    const topicIds = enrollments
      .filter((e) => e.subject_id === subject_id && e.topic_id)
      .map((e) => e.topic_id)
      .filter((id): id is string => id !== null);

    if (topicIds.length === 0) {
      return { topics: [] };
    }

    const topics = await Topic.findAll({
      where: { id: topicIds },
      attributes: ["id", "name"],
      raw: true,
    });

    return { topics };
  }
}
