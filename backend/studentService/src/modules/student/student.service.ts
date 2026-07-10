import { Op, fn, col, literal } from "sequelize";
import Student from "./student.model";
import Enrollment from "../enrollment/enrollment.model";
import Faculty from "../faculty/faculty.model";
import Subject from "../subject/subject.model";
import Topic from "../topic/topic.model";
import { ApiError } from "../../utils/ApiError";

interface GetStudentsWithFiltersInput {
  faculty_id?: string;
  subject_id?: string;
  topic_id?: string;
  page: number;
  limit: number;
}

export class StudentService {
  static async getStudentsWithFilters(data: GetStudentsWithFiltersInput) {
    const { faculty_id, subject_id, topic_id, page, limit } = data;
    const offset = (page - 1) * limit;

    const whereConditions: any = {
      role: "student",
    };

    const includeOptions: any[] = [
      {
        model: Enrollment,
        as: "enrollments",
        attributes: [],
        required: false,
      },
    ];

    if (faculty_id) {
      includeOptions[0].required = true;
      includeOptions[0].where = {
        ...includeOptions[0].where,
        faculty_id,
      };

      if (subject_id) {
        includeOptions[0].where = {
          ...includeOptions[0].where,
          subject_id,
        };
      }

      if (topic_id) {
        includeOptions[0].where = {
          ...includeOptions[0].where,
          topic_id,
        };
      }
    }

    const { rows: users, count: countResult } = await Student.findAndCountAll({
      where: whereConditions,
      attributes: {
        exclude: ["password"],
        include: [
          [fn("COUNT", col("enrollments.id")), "enrollmentCount"],
        ],
      },
      include: includeOptions,
      group: ["User.id"],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      subQuery: false,
      distinct: true,
    });

    const total = Array.isArray(countResult) ? countResult.length : Number(countResult);

    return {
      students: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getStudentEnrollments(studentId: string, page: number, limit: number) {
    const offset = (page - 1) * limit;

    const student = await Student.findOne({
      where: { id: studentId, role: "student" },
      attributes: { exclude: ["password"] },
    });

    if (!student) {
      throw ApiError.notFound("Student not found");
    }

    const { rows: enrollments, count: total } = await Enrollment.findAndCountAll({
      where: { student_id: studentId },
      include: [
        { model: Faculty, as: "faculty", attributes: ["id", "name"] },
        { model: Subject, as: "subject", attributes: ["id", "name"] },
        { model: Topic, as: "topic", attributes: ["id", "name"] },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    return {
      student: student.toJSON(),
      enrollments: enrollments.map((e) => e.toJSON()),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
