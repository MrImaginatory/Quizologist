import { fn, col, Op } from "sequelize";
import TeacherAssignment from "./teacherAssignment.model";
import Teacher from "../teacher/teacher.model";
import Course from "../course/course.model";
import Subject from "../subject/subject.model";
import Enrollment from "../enrollment/enrollment.model";
import TestSession from "../testSession/testSession.model";
import { ApiError } from "../../utils/ApiError";

interface AssignCourseInput {
  teacher_id: string;
  course_id: string;
}

interface AssignSubjectInput {
  teacher_id: string;
  course_id: string;
  subject_id: string;
}

interface BulkAssignSubjectsInput {
  teacher_id: string;
  course_id: string;
  subject_ids?: string[];
}

interface GetAssignmentsInput {
  teacher_id?: string;
  course_id?: string;
  page: number;
  limit: number;
}

interface GetTeachingStudentsInput {
  teacherId: string;
  course_id?: string;
  subject_id?: string;
  page: number;
  limit: number;
}

interface GetTeachingTestsInput {
  teacherId: string;
  course_id?: string;
  subject_id?: string;
  status?: string;
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

    const courseCounts = await TeacherAssignment.findAll({
      attributes: [
        "teacher_id",
        [fn("COUNT", fn("DISTINCT", col("course_id"))), "courseCount"],
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

    const courseMap = new Map<string, number>();
    const subjectMap = new Map<string, number>();

    for (const cc of courseCounts as any[]) {
      courseMap.set(cc.teacher_id, parseInt(cc.courseCount, 10));
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
      courseCount: courseMap.get(t.id) || 0,
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

  static async assignCourse(data: AssignCourseInput): Promise<any> {
    const { teacher_id, course_id } = data;

    const teacher = await Teacher.findOne({
      where: { id: teacher_id, role: "teacher" },
    });

    if (!teacher) {
      throw ApiError.notFound("Teacher not found");
    }

    const course = await Course.findByPk(course_id);
    if (!course) {
      throw ApiError.notFound("Course not found");
    }

    const existing = await TeacherAssignment.findOne({
      where: {
        teacher_id,
        course_id,
        subject_id: null,
      },
    });

    if (existing) {
      throw ApiError.conflict("Teacher is already assigned to this course");
    }

    const assignment = await TeacherAssignment.create({
      teacher_id,
      course_id,
    });

    return assignment.toJSON();
  }

  static async assignSubject(data: AssignSubjectInput): Promise<any> {
    const { teacher_id, course_id, subject_id } = data;

    const teacher = await Teacher.findOne({
      where: { id: teacher_id, role: "teacher" },
    });

    if (!teacher) {
      throw ApiError.notFound("Teacher not found");
    }

    const course = await Course.findByPk(course_id);
    if (!course) {
      throw ApiError.notFound("Course not found");
    }

    const subject = await Subject.findByPk(subject_id);
    if (!subject) {
      throw ApiError.notFound("Subject not found");
    }

    if (subject.course_id !== course_id) {
      throw ApiError.badRequest("Subject does not belong to the specified course");
    }

    const existing = await TeacherAssignment.findOne({
      where: {
        teacher_id,
        course_id,
        subject_id,
      },
    });

    if (existing) {
      throw ApiError.conflict("Teacher is already assigned to this subject");
    }

    const assignment = await TeacherAssignment.create({
      teacher_id,
      course_id,
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
    const { teacher_id, course_id, page, limit } = data;
    const offset = (page - 1) * limit;

    const whereConditions: any = {};

    if (teacher_id) {
      whereConditions.teacher_id = teacher_id;
    }

    if (course_id) {
      whereConditions.course_id = course_id;
    }

    const { rows: assignments, count: total } = await TeacherAssignment.findAndCountAll({
      where: whereConditions,
      include: [
        { model: Teacher, as: "teacher", attributes: ["id", "fname", "lname", "email"] },
        { model: Course, as: "course", attributes: ["id", "name"] },
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
        { model: Course, as: "course", attributes: ["id", "name"] },
        { model: Subject, as: "subject", attributes: ["id", "name"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    const courseMap = new Map<string, { id: string; name: string; assignment_id?: string; subjects: { id: string; name: string; assignment_id: string }[] }>();

    for (const assignment of assignments) {
      const a = assignment.toJSON() as any;
      const courseId = a.course.id;

      if (!courseMap.has(courseId)) {
        courseMap.set(courseId, {
          id: a.course.id,
          name: a.course.name,
          subjects: [],
        });
      }

      if (a.subject) {
        courseMap.get(courseId)!.subjects.push({
          id: a.subject.id,
          name: a.subject.name,
          assignment_id: a.id,
        });
      } else {
        courseMap.get(courseId)!.assignment_id = a.id;
      }
    }

    return {
      teacher: teacher.toJSON(),
      assignments: Array.from(courseMap.values()),
    };
  }

  static async bulkAssignSubjects(data: BulkAssignSubjectsInput): Promise<any> {
    const { teacher_id, course_id, subject_ids } = data;

    const teacher = await Teacher.findOne({
      where: { id: teacher_id, role: "teacher" },
    });

    if (!teacher) {
      throw ApiError.notFound("Teacher not found");
    }

    const course = await Course.findByPk(course_id);
    if (!course) {
      throw ApiError.notFound("Course not found");
    }

    let subjectsToAssign: string[];

    if (subject_ids && subject_ids.length > 0) {
      subjectsToAssign = subject_ids;
    } else {
      const allSubjects = await Subject.findAll({
        where: { course_id },
        attributes: ["id"],
      });
      subjectsToAssign = allSubjects.map((s) => s.id);
    }

    if (subjectsToAssign.length === 0) {
      return {
        total: 0,
        created: 0,
        skipped: 0,
        assignments: [],
      };
    }

    const existingAssignments = await TeacherAssignment.findAll({
      where: {
        teacher_id,
        course_id,
        subject_id: { [Op.in]: subjectsToAssign },
      },
      attributes: ["subject_id"],
    });

    const existingSubjectIds = new Set(
      existingAssignments.map((a) => a.subject_id)
    );

    const created: any[] = [];
    const skipped: string[] = [];

    for (const subjectId of subjectsToAssign) {
      if (existingSubjectIds.has(subjectId)) {
        skipped.push(subjectId);
        continue;
      }

      const subject = await Subject.findByPk(subjectId);
      if (!subject || subject.course_id !== course_id) {
        skipped.push(subjectId);
        continue;
      }

      const assignment = await TeacherAssignment.create({
        teacher_id,
        course_id,
        subject_id: subjectId,
      });

      created.push(assignment.toJSON());
    }

    return {
      total: subjectsToAssign.length,
      created: created.length,
      skipped: skipped.length,
      assignments: created,
    };
  }

  static async getTeachingStudents(data: GetTeachingStudentsInput): Promise<any> {
    const { teacherId, course_id, subject_id, page, limit } = data;
    const offset = (page - 1) * limit;

    const whereConditions: any = { teacher_id: teacherId };
    if (course_id) whereConditions.course_id = course_id;
    if (subject_id) whereConditions.subject_id = subject_id;

    const assignments = await TeacherAssignment.findAll({
      where: whereConditions,
      attributes: ["course_id", "subject_id"],
      raw: true,
    });

    if (assignments.length === 0) {
      return {
        students: [],
        pagination: { total: 0, page, limit, totalPages: 0 },
      };
    }

    const courseSubjectPairs = assignments.map((a) => ({
      course_id: a.course_id,
      subject_id: a.subject_id,
    }));

    const enrollmentConditions: any[] = [];
    for (const pair of courseSubjectPairs) {
      const condition: any = { course_id: pair.course_id };
      if (pair.subject_id) {
        condition.subject_id = pair.subject_id;
      }
      enrollmentConditions.push(condition);
    }

    const enrollments = await Enrollment.findAndCountAll({
      where: {
        [Op.or]: enrollmentConditions,
      },
      attributes: ["student_id", "course_id", "subject_id"],
      group: ["student_id", "course_id", "subject_id"],
      limit,
      offset,
      raw: true,
    });

    const studentIds = [...new Set(enrollments.rows.map((e) => e.student_id))];

    if (studentIds.length === 0) {
      return {
        students: [],
        pagination: { total: 0, page, limit, totalPages: 0 },
      };
    }

    const students = await Teacher.findAll({
      where: {
        id: { [Op.in]: studentIds },
        role: "student",
      },
      attributes: ["id", "fname", "lname", "email"],
      raw: true,
    });

    const studentMap = new Map(students.map((s) => [s.id, s]));

    const result = enrollments.rows.map((enrollment) => {
      const student = studentMap.get(enrollment.student_id);
      return {
        id: enrollment.student_id,
        fname: student?.fname || "",
        lname: student?.lname || "",
        email: student?.email || "",
        course_id: enrollment.course_id,
        subject_id: enrollment.subject_id,
      };
    });

    const totalCount = Array.isArray(enrollments.count)
      ? enrollments.count.length
      : Number(enrollments.count);

    return {
      students: result,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  static async getTeachingTests(data: GetTeachingTestsInput): Promise<any> {
    const { teacherId, course_id, subject_id, status, page, limit } = data;
    const offset = (page - 1) * limit;

    const whereConditions: any = { teacher_id: teacherId };
    if (course_id) whereConditions.course_id = course_id;
    if (subject_id) whereConditions.subject_id = subject_id;

    const assignments = await TeacherAssignment.findAll({
      where: whereConditions,
      attributes: ["course_id", "subject_id"],
      raw: true,
    });

    if (assignments.length === 0) {
      return {
        tests: [],
        pagination: { total: 0, page, limit, totalPages: 0 },
      };
    }

    const courseSubjectPairs = assignments.map((a) => ({
      course_id: a.course_id,
      subject_id: a.subject_id,
    }));

    const enrollmentConditions: any[] = [];
    for (const pair of courseSubjectPairs) {
      const condition: any = { course_id: pair.course_id };
      if (pair.subject_id) {
        condition.subject_id = pair.subject_id;
      }
      enrollmentConditions.push(condition);
    }

    const enrollments = await Enrollment.findAll({
      where: {
        [Op.or]: enrollmentConditions,
      },
      attributes: ["student_id"],
      raw: true,
    });

    const studentIds = [...new Set(enrollments.map((e) => e.student_id))];

    if (studentIds.length === 0) {
      return {
        tests: [],
        pagination: { total: 0, page, limit, totalPages: 0 },
      };
    }

    const testConditions: any = {
      student_id: { [Op.in]: studentIds },
    };
    if (status) testConditions.status = status;

    const { rows: tests, count: total } = await TestSession.findAndCountAll({
      where: testConditions,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const testStudentIds = [...new Set(tests.map((t) => t.student_id))];
    const testStudents = await Teacher.findAll({
      where: {
        id: { [Op.in]: testStudentIds },
      },
      attributes: ["id", "fname", "lname", "email"],
      raw: true,
    });

    const studentMap = new Map(testStudents.map((s) => [s.id, s]));

    const result = tests.map((test) => {
      const student = studentMap.get(test.student_id);
      return {
        id: test.id,
        test_id: test.test_id,
        student: {
          id: test.student_id,
          fname: student?.fname || "",
          lname: student?.lname || "",
          email: student?.email || "",
        },
        status: test.status,
        subject_id: test.subject_id,
        topic_id: test.topic_id,
        total_questions: test.total_questions,
        attempted: test.attempted,
        correct: test.correct,
        incorrect: test.incorrect,
        score: test.score,
        started_at: test.started_at,
        completed_at: test.completed_at,
      };
    });

    return {
      tests: result,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
