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

    const usersByLocation = await sequelize.query(
      `SELECT l.id, l.city, l.state, COUNT(u.id) as user_count
       FROM locations l
       LEFT JOIN users u ON u.location_id = l.id AND u.deleted_at IS NULL
       WHERE l.deleted_at IS NULL
       GROUP BY l.id, l.city, l.state
       ORDER BY user_count DESC
       LIMIT 10`,
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
      usersByLocation,
    };
  }

  static async getTeacherStats(teacherId: string) {
    const questionsAddedResult = await sequelize.query(
      `SELECT COUNT(*) as count FROM questions WHERE question_added_by = :teacherId AND deleted_at IS NULL`,
      { type: QueryTypes.SELECT, replacements: { teacherId } }
    ) as any[];

    const assignedCourses = await sequelize.query(
      `SELECT course_id FROM teacher_assignments WHERE teacher_id = :teacherId AND deleted_at IS NULL`,
      { type: QueryTypes.SELECT, replacements: { teacherId } }
    ) as any[];

    const courseIds = Array.isArray(assignedCourses)
      ? assignedCourses.map((c: any) => c.course_id)
      : [];

    // Get teacher's location for filtering
    const [teacherLoc] = await sequelize.query(
      `SELECT location_id FROM users WHERE id = :teacherId`,
      { type: QueryTypes.SELECT, replacements: { teacherId } }
    ) as any[];
    const teacherLocationId = teacherLoc?.location_id || null;

    let studentsInCourses = 0;
    let testsSubmitted = 0;
    let questionsInCourses = 0;

    if (courseIds.length > 0) {
      const placeholders = courseIds.map((_val: string, i: number) => `:courseId${i}`).join(", ");

      // Build location filter for student queries
      const locationFilter = teacherLocationId
        ? `AND u.location_id = :locationId`
        : '';

      const [studentCount] = await sequelize.query(
        `SELECT COUNT(DISTINCT e.student_id) as count
         FROM enrollments e
         JOIN users u ON u.id = e.student_id
         WHERE e.course_id IN (${placeholders}) AND e.deleted_at IS NULL ${locationFilter}`,
        {
          type: QueryTypes.SELECT,
          replacements: {
            ...courseIds.reduce((acc: Record<string, string>, id: string, i: number) => {
              acc[`courseId${i}`] = id;
              return acc;
            }, {}),
            ...(teacherLocationId ? { locationId: teacherLocationId } : {}),
          },
        }
      ) as any[];
      studentsInCourses = parseInt(studentCount?.count || "0", 10);

      const [testCount] = await sequelize.query(
        `SELECT COUNT(*) as count
         FROM test_sessions ts
         JOIN enrollments e ON ts.student_id = e.student_id
         JOIN users u ON u.id = e.student_id
         WHERE e.course_id IN (${placeholders})
         AND ts.status = 'completed' AND e.deleted_at IS NULL ${locationFilter}`,
        {
          type: QueryTypes.SELECT,
          replacements: {
            ...courseIds.reduce((acc: Record<string, string>, id: string, i: number) => {
              acc[`courseId${i}`] = id;
              return acc;
            }, {}),
            ...(teacherLocationId ? { locationId: teacherLocationId } : {}),
          },
        }
      ) as any[];
      testsSubmitted = parseInt(testCount?.count || "0", 10);

      const [questionCount] = await sequelize.query(
        `SELECT COUNT(*) as count
         FROM questions
         WHERE course_id IN (${placeholders}) AND deleted_at IS NULL`,
        {
          type: QueryTypes.SELECT,
          replacements: courseIds.reduce((acc: Record<string, string>, id: string, i: number) => {
            acc[`courseId${i}`] = id;
            return acc;
          }, {}),
        }
      ) as any[];
      questionsInCourses = parseInt(questionCount?.count || "0", 10);
    }

    const questionsAddedCount = Array.isArray(questionsAddedResult) && questionsAddedResult.length > 0
      ? parseInt(questionsAddedResult[0]?.count || "0", 10)
      : 0;

    return {
      questionsAdded: questionsAddedCount,
      studentsInCourses,
      testsSubmitted,
      questionsInCourses,
    };
  }

  static async getStudentStats(studentId: string) {
    const enrolledCourses = await sequelize.query(
      `SELECT course_id FROM enrollments WHERE student_id = :studentId AND deleted_at IS NULL`,
      { type: QueryTypes.SELECT, replacements: { studentId } }
    ) as any[];

    const courseIds = Array.isArray(enrolledCourses)
      ? enrolledCourses.map((c: any) => c.course_id)
      : [];

    let questionsInEnrolledCourses = 0;

    if (courseIds.length > 0) {
      const placeholders = courseIds.map((_val: string, i: number) => `:courseId${i}`).join(", ");

      const [questionCount] = await sequelize.query(
        `SELECT COUNT(*) as count
         FROM questions
         WHERE course_id IN (${placeholders}) AND deleted_at IS NULL`,
        {
          type: QueryTypes.SELECT,
          replacements: courseIds.reduce((acc: Record<string, string>, id: string, i: number) => {
            acc[`courseId${i}`] = id;
            return acc;
          }, {}),
        }
      ) as any[];
      questionsInEnrolledCourses = parseInt(questionCount?.count || "0", 10);
    }

    const [testsSubmitted] = await sequelize.query(
      `SELECT COUNT(*) as count FROM test_sessions WHERE student_id = :studentId AND status = 'completed'`,
      { type: QueryTypes.SELECT, replacements: { studentId } }
    ) as any[];

    return {
      questionsInEnrolledCourses,
      testsSubmitted: parseInt(testsSubmitted?.count || "0", 10),
    };
  }
}
