import { fn, col } from "sequelize";
import TeacherAssignment from "./teacherAssignment.model";
import Teacher from "../teacher/teacher.model";
import Faculty from "../faculty/faculty.model";
import Subject from "../subject/subject.model";
import { ApiError } from "../../utils/ApiError";

interface AssignFacultyInput {
  teacher_id: string;
  faculty_id: string;
}

interface AssignSubjectInput {
  teacher_id: string;
  faculty_id: string;
  subject_id: string;
}

interface GetAssignmentsInput {
  teacher_id?: string;
  faculty_id?: string;
  page: number;
  limit: number;
}

export class TeacherAssignmentService {
  static async getTeachersWithCounts(page: number, limit: number): Promise<any> {
    const offset = (page - 1) * limit;

    const { rows: teachers, count: total } = await Teacher.findAndCountAll({
      where: { role: "teacher" },
      attributes: {
        exclude: ["password"],
        include: [
          [fn("COUNT", col("assignments.id")), "totalAssignments"],
        ],
      },
      include: [
        {
          model: TeacherAssignment,
          as: "assignments",
          attributes: [],
        },
      ],
      group: ["User.id"],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      subQuery: false,
      distinct: true,
    });

    const teacherIds = teachers.map((t: any) => t.id);

    const facultyCounts = await TeacherAssignment.findAll({
      attributes: [
        "teacher_id",
        [fn("COUNT", fn("DISTINCT", col("faculty_id"))), "facultyCount"],
      ],
      where: { teacher_id: teacherIds },
      group: ["teacher_id"],
      raw: true,
    });

    const subjectCounts = await TeacherAssignment.findAll({
      attributes: [
        "teacher_id",
        [fn("COUNT", fn("DISTINCT", col("subject_id"))), "subjectCount"],
      ],
      where: { teacher_id: teacherIds, subject_id: { [Symbol.for("ne")]: null } },
      group: ["teacher_id"],
      raw: true,
    });

    const facultyMap = new Map<string, number>();
    const subjectMap = new Map<string, number>();

    for (const fc of facultyCounts as any[]) {
      facultyMap.set(fc.teacher_id, parseInt(fc.facultyCount, 10));
    }

    for (const sc of subjectCounts as any[]) {
      subjectMap.set(sc.teacher_id, parseInt(sc.subjectCount, 10));
    }

    const result = teachers.map((t: any) => ({
      id: t.id,
      fname: t.fname,
      lname: t.lname,
      email: t.email,
      mobileNumber: t.mobileNumber,
      createdAt: t.createdAt,
      facultyCount: facultyMap.get(t.id) || 0,
      subjectCount: subjectMap.get(t.id) || 0,
      totalAssignments: parseInt(t.dataValues.totalAssignments, 10) || 0,
    }));

    const countVal = Array.isArray(total) ? total.length : Number(total);

    return {
      teachers: result,
      pagination: {
        total: countVal,
        page,
        limit,
        totalPages: Math.ceil(countVal / limit),
      },
    };
  }
  static async assignFaculty(data: AssignFacultyInput): Promise<any> {
    const { teacher_id, faculty_id } = data;

    const teacher = await Teacher.findOne({
      where: { id: teacher_id, role: "teacher" },
    });

    if (!teacher) {
      throw ApiError.notFound("Teacher not found");
    }

    const faculty = await Faculty.findByPk(faculty_id);
    if (!faculty) {
      throw ApiError.notFound("Faculty not found");
    }

    const existing = await TeacherAssignment.findOne({
      where: {
        teacher_id,
        faculty_id,
        subject_id: null,
      },
    });

    if (existing) {
      throw ApiError.conflict("Teacher is already assigned to this faculty");
    }

    const assignment = await TeacherAssignment.create({
      teacher_id,
      faculty_id,
    });

    return assignment.toJSON();
  }

  static async assignSubject(data: AssignSubjectInput): Promise<any> {
    const { teacher_id, faculty_id, subject_id } = data;

    const teacher = await Teacher.findOne({
      where: { id: teacher_id, role: "teacher" },
    });

    if (!teacher) {
      throw ApiError.notFound("Teacher not found");
    }

    const faculty = await Faculty.findByPk(faculty_id);
    if (!faculty) {
      throw ApiError.notFound("Faculty not found");
    }

    const subject = await Subject.findByPk(subject_id);
    if (!subject) {
      throw ApiError.notFound("Subject not found");
    }

    if (subject.faculty_id !== faculty_id) {
      throw ApiError.badRequest("Subject does not belong to the specified faculty");
    }

    const existing = await TeacherAssignment.findOne({
      where: {
        teacher_id,
        faculty_id,
        subject_id,
      },
    });

    if (existing) {
      throw ApiError.conflict("Teacher is already assigned to this subject");
    }

    const assignment = await TeacherAssignment.create({
      teacher_id,
      faculty_id,
      subject_id,
    });

    return assignment.toJSON();
  }

  static async removeAssignment(assignmentId: string) {
    const assignment = await TeacherAssignment.findByPk(assignmentId);

    if (!assignment) {
      throw ApiError.notFound("Assignment not found");
    }

    await assignment.destroy();

    return { message: "Assignment removed successfully" };
  }

  static async getAssignments(data: GetAssignmentsInput): Promise<any> {
    const { teacher_id, faculty_id, page, limit } = data;
    const offset = (page - 1) * limit;

    const whereConditions: any = {};

    if (teacher_id) {
      whereConditions.teacher_id = teacher_id;
    }

    if (faculty_id) {
      whereConditions.faculty_id = faculty_id;
    }

    const { rows: assignments, count: total } = await TeacherAssignment.findAndCountAll({
      where: whereConditions,
      include: [
        { model: Teacher, as: "teacher", attributes: ["id", "fname", "lname", "email"] },
        { model: Faculty, as: "faculty", attributes: ["id", "name"] },
        { model: Subject, as: "subject", attributes: ["id", "name"] },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    return {
      assignments: assignments.map((a) => a.toJSON()),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getTeacherAssignments(teacherId: string) {
    const teacher = await Teacher.findOne({
      where: { id: teacherId, role: "teacher" },
      attributes: { exclude: ["password"] },
    });

    if (!teacher) {
      throw ApiError.notFound("Teacher not found");
    }

    const assignments = await TeacherAssignment.findAll({
      where: { teacher_id: teacherId },
      include: [
        { model: Faculty, as: "faculty", attributes: ["id", "name"] },
        { model: Subject, as: "subject", attributes: ["id", "name"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    const facultyMap = new Map<string, { id: string; name: string; assignment_id?: string; subjects: { id: string; name: string; assignment_id: string }[] }>();

    for (const assignment of assignments) {
      const a = assignment.toJSON() as any;
      const facultyId = a.faculty.id;

      if (!facultyMap.has(facultyId)) {
        facultyMap.set(facultyId, {
          id: a.faculty.id,
          name: a.faculty.name,
          subjects: [],
        });
      }

      if (a.subject) {
        facultyMap.get(facultyId)!.subjects.push({
          id: a.subject.id,
          name: a.subject.name,
          assignment_id: a.id,
        });
      } else {
        // This assignment represents the faculty assignment itself
        facultyMap.get(facultyId)!.assignment_id = a.id;
      }
    }

    return {
      teacher: teacher.toJSON(),
      assignments: Array.from(facultyMap.values()),
    };
  }
}
