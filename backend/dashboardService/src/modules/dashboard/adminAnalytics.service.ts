import { fn, col, Op, literal } from "sequelize";
import { sequelize } from "../../config/database";
import { QueryTypes } from "sequelize";

// Models (read-only, timestamps disabled)
import { TestSession, TestAnswer, Question, Topic, Subject, Course } from "../models";

// We need to import User and Location models for analytics
// Since dashboardService doesn't have them, we'll use raw SQL for user/location queries
// but Sequelize ORM for the rest

export interface TeacherStudentRatioParams {
  location_id?: string;
}

export interface TopStudentsParams {
  location_id?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
}

export interface LeastQuestionsParams {
  course_id?: string;
  subject_id?: string;
}

export interface SubjectsAttentionParams {
  date_from?: string;
  date_to?: string;
}

export class AdminAnalyticsService {
  // ==================== Module 1: Teacher-Student Ratio ====================

  static async getTeacherStudentRatio(params: TeacherStudentRatioParams) {
    const { location_id } = params;

    // Get teacher counts per location
    const teacherCounts = await sequelize.query(
      `SELECT u.location_id, COUNT(*) as count
       FROM users u
       WHERE u.role = 'teacher' AND u.deleted_at IS NULL
       ${location_id ? 'AND u.location_id = :locationId' : ''}
       GROUP BY u.location_id`,
      {
        type: QueryTypes.SELECT,
        replacements: location_id ? { locationId: location_id } : {},
      }
    ) as any[];

    // Get student counts per location
    const studentCounts = await sequelize.query(
      `SELECT u.location_id, COUNT(*) as count
       FROM users u
       WHERE u.role = 'student' AND u.deleted_at IS NULL
       ${location_id ? 'AND u.location_id = :locationId' : ''}
       GROUP BY u.location_id`,
      {
        type: QueryTypes.SELECT,
        replacements: location_id ? { locationId: location_id } : {},
      }
    ) as any[];

    // Get all locations
    const locations = await sequelize.query(
      `SELECT id, city, state FROM locations WHERE deleted_at IS NULL
       ${location_id ? 'AND id = :locationId' : ''}
       ORDER BY city`,
      {
        type: QueryTypes.SELECT,
        replacements: location_id ? { locationId: location_id } : {},
      }
    ) as any[];

    // Build teacher map
    const teacherMap = new Map<string, number>();
    for (const row of teacherCounts) {
      teacherMap.set(row.location_id, parseInt(row.count, 10));
    }

    // Build student map
    const studentMap = new Map<string, number>();
    for (const row of studentCounts) {
      studentMap.set(row.location_id, parseInt(row.count, 10));
    }

    // Combine data
    const locationData = locations.map((loc: any) => {
      const teachers = teacherMap.get(loc.id) || 0;
      const students = studentMap.get(loc.id) || 0;
      const ratio = teachers > 0 ? `1:${Math.round(students / teachers)}` : `0:${students}`;
      return {
        id: loc.id,
        city: loc.city,
        state: loc.state,
        teacher_count: teachers,
        student_count: students,
        ratio,
      };
    });

    // Sort by student count descending
    locationData.sort((a: any, b: any) => b.student_count - a.student_count);

    const totalTeachers = locationData.reduce((sum: number, l: any) => sum + l.teacher_count, 0);
    const totalStudents = locationData.reduce((sum: number, l: any) => sum + l.student_count, 0);

    return {
      locations: locationData,
      total_teachers: totalTeachers,
      total_students: totalStudents,
    };
  }

  // ==================== Module 2: Top Students by Location ====================

  static async getTopStudentsByLocation(params: TopStudentsParams) {
    const { location_id, date_from, date_to, limit = 10 } = params;

    // Build date filters
    let dateFilter = "";
    const replacements: any = { limit };

    if (date_from) {
      dateFilter += " AND ts.completed_at >= :dateFrom";
      replacements.dateFrom = new Date(date_from);
    }
    if (date_to) {
      dateFilter += " AND ts.completed_at <= :dateTo";
      replacements.dateTo = new Date(date_to);
    }

    // Get top students by average score
    const topStudents = await sequelize.query(
      `SELECT
        ts.student_id,
        COUNT(ts.id) as total_tests,
        ROUND(AVG(ts.score), 2) as avg_score,
        SUM(ts.correct) as total_correct,
        SUM(ts.total_questions) as total_questions
       FROM test_sessions ts
       WHERE ts.status = 'completed' ${dateFilter}
       GROUP BY ts.student_id
       ORDER BY avg_score DESC
       LIMIT :limit`,
      { type: QueryTypes.SELECT, replacements }
    ) as any[];

    if (topStudents.length === 0) {
      return { students: [] };
    }

    const studentIds = topStudents.map((s: any) => s.student_id);

    // Get user details with location
    let userWhere = `u.id IN (:studentIds) AND u.role = 'student' AND u.deleted_at IS NULL`;
    if (location_id) {
      userWhere += " AND u.location_id = :locationId";
    }

    const users = await sequelize.query(
      `SELECT u.id, u.fname, u.lname, u.email, u.location_id,
              l.city, l.state
       FROM users u
       LEFT JOIN locations l ON l.id = u.location_id
       WHERE ${userWhere}`,
      {
        type: QueryTypes.SELECT,
        replacements: { studentIds, ...(location_id ? { locationId: location_id } : {}) },
      }
    ) as any[];

    const userMap = new Map<string, any>();
    for (const user of users) {
      userMap.set(user.id, user);
    }

    // Merge and rank
    const rankedStudents = topStudents
      .map((s: any, index: number) => {
        const user = userMap.get(s.student_id);
        if (!user) return null;
        return {
          id: user.id,
          fname: user.fname,
          lname: user.lname,
          email: user.email,
          city: user.city || "N/A",
          state: user.state || "",
          total_tests: parseInt(s.total_tests, 10),
          avg_score: parseFloat(s.avg_score),
          total_correct: parseInt(s.total_correct, 10),
          total_questions: parseInt(s.total_questions, 10),
          rank: index + 1,
        };
      })
      .filter(Boolean);

    // If location filter is applied, filter out students not in that location
    const filtered = location_id
      ? rankedStudents.filter((s: any) => s !== null)
      : rankedStudents;

    return { students: filtered };
  }

  // ==================== Module 3: Least Questions ====================

  static async getLeastQuestions(params: LeastQuestionsParams) {
    const { course_id, subject_id } = params;

    // Build where conditions
    let whereConditions = "t.deleted_at IS NULL AND s.deleted_at IS NULL AND c.deleted_at IS NULL";
    const replacements: any = {};

    if (course_id) {
      whereConditions += " AND c.id = :courseId";
      replacements.courseId = course_id;
    }
    if (subject_id) {
      whereConditions += " AND s.id = :subjectId";
      replacements.subjectId = subject_id;
    }

    const topics = await sequelize.query(
      `SELECT
        t.id as "topicId",
        t.name as "topicName",
        s.name as "subjectName",
        c.name as "courseName",
        COUNT(q.id) as "questionCount"
       FROM topics t
       JOIN subjects s ON s.id = t.subject_id AND s.deleted_at IS NULL
       JOIN courses c ON c.id = s.course_id AND c.deleted_at IS NULL
       LEFT JOIN questions q ON q.topic_id = t.id AND q.deleted_at IS NULL
       WHERE ${whereConditions}
       GROUP BY t.id, t.name, s.name, c.name
       ORDER BY "questionCount" ASC
       LIMIT 10`,
      { type: QueryTypes.SELECT, replacements }
    ) as any[];

    // Add status label
    const result = topics.map((t: any) => ({
      topicId: t.topicId,
      topicName: t.topicName,
      subjectName: t.subjectName,
      courseName: t.courseName,
      questionCount: parseInt(t.questionCount, 10),
      status: parseInt(t.questionCount, 10) < 5 ? "needs_questions" : "adequate",
    }));

    return { topics: result };
  }

  // ==================== Module 4: Subjects Needing Attention ====================

  static async getSubjectsNeedingAttention(params: SubjectsAttentionParams) {
    const { date_from, date_to } = params;

    // Build date filters
    let dateFilter = "";
    const replacements: any = {};

    if (date_from) {
      dateFilter += " AND ts.completed_at >= :dateFrom";
      replacements.dateFrom = new Date(date_from);
    }
    if (date_to) {
      dateFilter += " AND ts.completed_at <= :dateTo";
      replacements.dateTo = new Date(date_to);
    }

    // Get subject performance from test answers
    const subjectPerformance = await sequelize.query(
      `SELECT
        s.id as "subjectId",
        s.name as "subjectName",
        c.name as "courseName",
        ROUND(AVG(ts.score), 2) as "avgScore",
        COUNT(DISTINCT ts.student_id) as "studentCount",
        COUNT(DISTINCT CASE WHEN ts.score < 50 THEN ts.student_id END) as "belowPassingCount"
       FROM subjects s
       JOIN courses c ON c.id = s.course_id AND c.deleted_at IS NULL
       JOIN questions q ON q.subject_id = s.id AND q.deleted_at IS NULL
       JOIN test_answers ta ON ta.question_id = q.id
       JOIN test_sessions ts ON ts.id = ta.test_session_id AND ts.status = 'completed'
       WHERE s.deleted_at IS NULL ${dateFilter}
       GROUP BY s.id, s.name, c.name
       ORDER BY "avgScore" ASC`,
      { type: QueryTypes.SELECT, replacements }
    ) as any[];

    // For each subject, get low-performing students
    const subjectsWithPerformers = await Promise.all(
      subjectPerformance.map(async (subject: any) => {
        let studentFilter = `
          JOIN test_answers ta2 ON ta2.question_id = q2.id
          JOIN test_sessions ts2 ON ts2.id = ta2.test_session_id AND ts2.status = 'completed'
          WHERE q2.subject_id = :subjectId ${dateFilter}
        `;

        const lowPerformers = await sequelize.query(
          `SELECT DISTINCT
            u.id as "studentId",
            u.fname,
            u.lname,
            ROUND(AVG(ts2.score), 2) as "avgScore"
           FROM users u
           JOIN test_sessions ts2 ON ts2.student_id = u.id AND ts2.status = 'completed'
           JOIN test_answers ta2 ON ta2.test_session_id = ts2.id
           JOIN questions q2 ON q2.id = ta2.question_id AND q2.subject_id = :subjectId
           WHERE u.role = 'student' AND u.deleted_at IS NULL ${dateFilter}
           GROUP BY u.id, u.fname, u.lname
           HAVING AVG(ts2.score) < 50
           ORDER BY "avgScore" ASC
           LIMIT 5`,
          {
            type: QueryTypes.SELECT,
            replacements: { subjectId: subject.subjectId, ...replacements },
          }
        ) as any[];

        return {
          subjectId: subject.subjectId,
          subjectName: subject.subjectName,
          courseName: subject.courseName,
          avgScore: parseFloat(subject.avgScore),
          studentCount: parseInt(subject.studentCount, 10),
          belowPassingCount: parseInt(subject.belowPassingCount, 10),
          lowPerformers: lowPerformers.map((p: any) => ({
            studentId: p.studentId,
            fname: p.fname,
            lname: p.lname,
            avgScore: parseFloat(p.avgScore),
          })),
        };
      })
    );

    return { subjects: subjectsWithPerformers };
  }
}
