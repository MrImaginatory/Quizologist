import { QueryTypes } from "sequelize";
import { sequelize } from "../../config/database";

export class DashboardService {
  static async getAdminStats() {
    const [testsSubmitted] = await sequelize.query(
      `SELECT COUNT(*) as count FROM test_sessions WHERE status = 'completed'`,
      { type: QueryTypes.SELECT }
    ) as any[];

    const [totalQuestions] = await sequelize.query(
      `SELECT COUNT(*) as count FROM questions WHERE deleted_at IS NULL`,
      { type: QueryTypes.SELECT }
    ) as any[];

    const [totalTopics] = await sequelize.query(
      `SELECT COUNT(*) as count FROM topics WHERE deleted_at IS NULL`,
      { type: QueryTypes.SELECT }
    ) as any[];

    const [topicsCovered] = await sequelize.query(
      `SELECT COUNT(DISTINCT topic_id) as count FROM questions WHERE deleted_at IS NULL AND topic_id IS NOT NULL`,
      { type: QueryTypes.SELECT }
    ) as any[];

    const [studentsCount] = await sequelize.query(
      `SELECT COUNT(*) as count FROM users WHERE role = 'student' AND deleted_at IS NULL`,
      { type: QueryTypes.SELECT }
    ) as any[];

    const [totalSubjects] = await sequelize.query(
      `SELECT COUNT(*) as count FROM subjects WHERE deleted_at IS NULL`,
      { type: QueryTypes.SELECT }
    ) as any[];

    const [totalTeachers] = await sequelize.query(
      `SELECT COUNT(*) as count FROM users WHERE role = 'teacher' AND deleted_at IS NULL`,
      { type: QueryTypes.SELECT }
    ) as any[];

    return {
      testsSubmitted: parseInt(testsSubmitted?.count || "0", 10),
      totalQuestions: parseInt(totalQuestions?.count || "0", 10),
      totalTopics: parseInt(totalTopics?.count || "0", 10),
      topicsCovered: parseInt(topicsCovered?.count || "0", 10),
      studentsCount: parseInt(studentsCount?.count || "0", 10),
      totalSubjects: parseInt(totalSubjects?.count || "0", 10),
      totalTeachers: parseInt(totalTeachers?.count || "0", 10),
    };
  }

  static async getTeacherStats(teacherId: string) {
    const questionsAddedResult = await sequelize.query(
      `SELECT COUNT(*) as count FROM questions WHERE question_added_by = :teacherId AND deleted_at IS NULL`,
      { type: QueryTypes.SELECT, replacements: { teacherId } }
    ) as any[];

    const assignedFaculties = await sequelize.query(
      `SELECT faculty_id FROM teacher_assignments WHERE teacher_id = :teacherId AND deleted_at IS NULL`,
      { type: QueryTypes.SELECT, replacements: { teacherId } }
    ) as any[];

    const facultyIds = Array.isArray(assignedFaculties)
      ? assignedFaculties.map((f: any) => f.faculty_id)
      : [];

    let studentsInFaculties = 0;
    let testsSubmitted = 0;
    let questionsInFaculties = 0;

    if (facultyIds.length > 0) {
      const placeholders = facultyIds.map((_val: string, i: number) => `:facultyId${i}`).join(", ");

      const [studentCount] = await sequelize.query(
        `SELECT COUNT(DISTINCT e.student_id) as count
         FROM enrollments e
         WHERE e.faculty_id IN (${placeholders}) AND e.deleted_at IS NULL`,
        {
          type: QueryTypes.SELECT,
          replacements: facultyIds.reduce((acc: Record<string, string>, id: string, i: number) => {
            acc[`facultyId${i}`] = id;
            return acc;
          }, {}),
        }
      ) as any[];
      studentsInFaculties = parseInt(studentCount?.count || "0", 10);

      const [testCount] = await sequelize.query(
        `SELECT COUNT(*) as count
         FROM test_sessions ts
         JOIN enrollments e ON ts.student_id = e.student_id
         WHERE e.faculty_id IN (${placeholders})
         AND ts.status = 'completed' AND e.deleted_at IS NULL`,
        {
          type: QueryTypes.SELECT,
          replacements: facultyIds.reduce((acc: Record<string, string>, id: string, i: number) => {
            acc[`facultyId${i}`] = id;
            return acc;
          }, {}),
        }
      ) as any[];
      testsSubmitted = parseInt(testCount?.count || "0", 10);

      const [questionCount] = await sequelize.query(
        `SELECT COUNT(*) as count
         FROM questions
         WHERE faculty_id IN (${placeholders}) AND deleted_at IS NULL`,
        {
          type: QueryTypes.SELECT,
          replacements: facultyIds.reduce((acc: Record<string, string>, id: string, i: number) => {
            acc[`facultyId${i}`] = id;
            return acc;
          }, {}),
        }
      ) as any[];
      questionsInFaculties = parseInt(questionCount?.count || "0", 10);
    }

    const questionsAddedCount = Array.isArray(questionsAddedResult) && questionsAddedResult.length > 0
      ? parseInt(questionsAddedResult[0]?.count || "0", 10)
      : 0;

    return {
      questionsAdded: questionsAddedCount,
      studentsInFaculties,
      testsSubmitted,
      questionsInFaculties,
    };
  }

  static async getStudentStats(studentId: string) {
    const enrolledFaculties = await sequelize.query(
      `SELECT faculty_id FROM enrollments WHERE student_id = :studentId AND deleted_at IS NULL`,
      { type: QueryTypes.SELECT, replacements: { studentId } }
    ) as any[];

    const facultyIds = Array.isArray(enrolledFaculties)
      ? enrolledFaculties.map((f: any) => f.faculty_id)
      : [];

    let questionsInEnrolledFaculties = 0;

    if (facultyIds.length > 0) {
      const placeholders = facultyIds.map((_val: string, i: number) => `:facultyId${i}`).join(", ");

      const [questionCount] = await sequelize.query(
        `SELECT COUNT(*) as count
         FROM questions
         WHERE faculty_id IN (${placeholders}) AND deleted_at IS NULL`,
        {
          type: QueryTypes.SELECT,
          replacements: facultyIds.reduce((acc: Record<string, string>, id: string, i: number) => {
            acc[`facultyId${i}`] = id;
            return acc;
          }, {}),
        }
      ) as any[];
      questionsInEnrolledFaculties = parseInt(questionCount?.count || "0", 10);
    }

    const [testsSubmitted] = await sequelize.query(
      `SELECT COUNT(*) as count FROM test_sessions WHERE student_id = :studentId AND status = 'completed'`,
      { type: QueryTypes.SELECT, replacements: { studentId } }
    ) as any[];

    return {
      questionsInEnrolledFaculties,
      testsSubmitted: parseInt(testsSubmitted?.count || "0", 10),
    };
  }
}
