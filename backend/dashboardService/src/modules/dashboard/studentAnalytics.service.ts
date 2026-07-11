import { Op, fn, col, literal } from "sequelize";
import { TestSession, TestAnswer, Question, Topic, Subject, Faculty } from "../models";

const MIN_ATTEMPTS = 3;

export class StudentAnalyticsService {
  /**
   * Get topic performance for a student.
   * Returns accuracy % and avg time per topic (min 3 attempts).
   */
  static async getTopicPerformance(studentId: string) {
    const completedTests = await TestSession.findAll({
      where: { student_id: studentId, status: "completed" },
      attributes: ["id"],
    });

    if (completedTests.length === 0) {
      return { topics: [], totalTests: 0 };
    }

    const testIds = completedTests.map((t) => t.id);

    const answers = await TestAnswer.findAll({
      where: {
        test_session_id: { [Op.in]: testIds },
        is_skipped: false,
      },
      include: [
        {
          model: Question,
          attributes: ["topic_id", "subject_id", "difficulty"],
          include: [
            { model: Topic, attributes: ["id", "name"] },
            { model: Subject, attributes: ["id", "name"] },
          ],
        },
      ],
    });

    const topicMap = new Map<
      string,
      { name: string; subjectName: string; correct: number; total: number; totalTime: number }
    >();

    for (const answer of answers) {
      const q = (answer as any).Question;
      if (!q || !q.Topic) continue;

      const topicId = q.topic_id;
      const topicName = q.Topic.name;
      const subjectName = q.Subject?.name || "";

      if (!topicMap.has(topicId)) {
        topicMap.set(topicId, {
          name: topicName,
          subjectName,
          correct: 0,
          total: 0,
          totalTime: 0,
        });
      }

      const topic = topicMap.get(topicId)!;
      topic.total++;
      if (answer.is_correct) topic.correct++;
      topic.totalTime += answer.time_taken || 0;
    }

    const topics = Array.from(topicMap.entries())
      .map(([id, data]) => ({
        topicId: id,
        topicName: data.name,
        subjectName: data.subjectName,
        totalAttempts: data.total,
        correctAnswers: data.correct,
        accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
        avgTimePerQuestion: data.total > 0 ? Math.round(data.totalTime / data.total) : 0,
        status: data.total >= MIN_ATTEMPTS
          ? data.correct / data.total >= 0.8
            ? "strong"
            : data.correct / data.total >= 0.5
            ? "moderate"
            : "weak"
          : "insufficient",
      }))
      .filter((t) => t.totalAttempts >= MIN_ATTEMPTS)
      .sort((a, b) => b.accuracy - a.accuracy);

    return {
      topics,
      totalTests: completedTests.length,
    };
  }

  /**
   * Get subject performance for a student.
   */
  static async getSubjectPerformance(studentId: string) {
    const completedTests = await TestSession.findAll({
      where: { student_id: studentId, status: "completed" },
      attributes: ["id"],
    });

    if (completedTests.length === 0) {
      return { subjects: [], totalTests: 0 };
    }

    const testIds = completedTests.map((t) => t.id);

    const answers = await TestAnswer.findAll({
      where: {
        test_session_id: { [Op.in]: testIds },
        is_skipped: false,
      },
      include: [
        {
          model: Question,
          attributes: ["subject_id"],
          include: [{ model: Subject, attributes: ["id", "name"] }],
        },
      ],
    });

    const subjectMap = new Map<
      string,
      { name: string; correct: number; total: number; totalTime: number }
    >();

    for (const answer of answers) {
      const q = (answer as any).Question;
      if (!q || !q.Subject) continue;

      const subjectId = q.subject_id;
      const subjectName = q.Subject.name;

      if (!subjectMap.has(subjectId)) {
        subjectMap.set(subjectId, { name: subjectName, correct: 0, total: 0, totalTime: 0 });
      }

      const subject = subjectMap.get(subjectId)!;
      subject.total++;
      if (answer.is_correct) subject.correct++;
      subject.totalTime += answer.time_taken || 0;
    }

    const subjects = Array.from(subjectMap.entries())
      .map(([id, data]) => ({
        subjectId: id,
        subjectName: data.name,
        totalAttempts: data.total,
        correctAnswers: data.correct,
        accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
        avgTimePerQuestion: data.total > 0 ? Math.round(data.totalTime / data.total) : 0,
        status:
          data.total >= MIN_ATTEMPTS
            ? data.correct / data.total >= 0.8
              ? "strong"
              : data.correct / data.total >= 0.5
              ? "moderate"
              : "weak"
            : "insufficient",
      }))
      .filter((s) => s.totalAttempts >= MIN_ATTEMPTS)
      .sort((a, b) => b.accuracy - a.accuracy);

    return {
      subjects,
      totalTests: completedTests.length,
    };
  }

  /**
   * Get difficulty breakdown for a student.
   */
  static async getDifficultyBreakdown(studentId: string) {
    const completedTests = await TestSession.findAll({
      where: { student_id: studentId, status: "completed" },
      attributes: ["id"],
    });

    if (completedTests.length === 0) {
      return { difficulties: [], totalTests: 0 };
    }

    const testIds = completedTests.map((t) => t.id);

    const answers = await TestAnswer.findAll({
      where: {
        test_session_id: { [Op.in]: testIds },
        is_skipped: false,
      },
      include: [
        {
          model: Question,
          attributes: ["difficulty"],
        },
      ],
    });

    const diffMap = new Map<string, { correct: number; total: number }>();

    for (const answer of answers) {
      const q = (answer as any).Question;
      if (!q) continue;

      const diff = q.difficulty || "normal";
      if (!diffMap.has(diff)) {
        diffMap.set(diff, { correct: 0, total: 0 });
      }

      const d = diffMap.get(diff)!;
      d.total++;
      if (answer.is_correct) d.correct++;
    }

    const difficulties = Array.from(diffMap.entries()).map(([level, data]) => ({
      level,
      totalAttempts: data.total,
      correctAnswers: data.correct,
      accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
    }));

    return {
      difficulties,
      totalTests: completedTests.length,
    };
  }

  /**
   * Get time analysis per topic.
   */
  static async getTimeAnalysis(studentId: string) {
    const completedTests = await TestSession.findAll({
      where: { student_id: studentId, status: "completed" },
      attributes: ["id"],
    });

    if (completedTests.length === 0) {
      return { topics: [], totalTests: 0 };
    }

    const testIds = completedTests.map((t) => t.id);

    const answers = await TestAnswer.findAll({
      where: {
        test_session_id: { [Op.in]: testIds },
        is_skipped: false,
      },
      include: [
        {
          model: Question,
          attributes: ["topic_id"],
          include: [{ model: Topic, attributes: ["id", "name"] }],
        },
      ],
    });

    const timeMap = new Map<string, { name: string; totalTime: number; count: number }>();

    for (const answer of answers) {
      const q = (answer as any).Question;
      if (!q || !q.Topic) continue;

      const topicId = q.topic_id;
      const topicName = q.Topic.name;

      if (!timeMap.has(topicId)) {
        timeMap.set(topicId, { name: topicName, totalTime: 0, count: 0 });
      }

      const t = timeMap.get(topicId)!;
      t.totalTime += answer.time_taken || 0;
      t.count++;
    }

    const topics = Array.from(timeMap.entries())
      .map(([id, data]) => ({
        topicId: id,
        topicName: data.name,
        avgTime: data.count > 0 ? Math.round(data.totalTime / data.count) : 0,
        totalQuestions: data.count,
      }))
      .filter((t) => t.totalQuestions >= MIN_ATTEMPTS)
      .sort((a, b) => b.avgTime - a.avgTime);

    return {
      topics,
      totalTests: completedTests.length,
    };
  }

  /**
   * Get performance trends for 15/30/60 day windows.
   */
  static async getPerformanceTrends(studentId: string) {
    const now = new Date();
    const d15 = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
    const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const d60 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const getTrend = async (since: Date) => {
      const tests = await TestSession.findAll({
        where: {
          student_id: studentId,
          status: "completed",
          created_at: { [Op.gte]: since },
        },
        order: [["created_at", "ASC"]],
        attributes: ["id", "score", "correct", "incorrect", "total_questions", "created_at"],
      });

      return tests.map((t) => ({
        testId: t.id,
        score: parseFloat(String(t.score)),
        correct: t.correct,
        incorrect: t.incorrect,
        totalQuestions: t.total_questions,
        date: t.created_at,
      }));
    };

    const [trend15, trend30, trend60] = await Promise.all([
      getTrend(d15),
      getTrend(d30),
      getTrend(d60),
    ]);

    return {
      last15Days: trend15,
      last30Days: trend30,
      last60Days: trend60,
    };
  }

  /**
   * Get combined strengths and weaknesses summary.
   */
  static async getStrengthsWeaknesses(studentId: string) {
    const topicData = await this.getTopicPerformance(studentId);

    const strong = topicData.topics.filter((t) => t.status === "strong").slice(0, 5);
    const weak = topicData.topics.filter((t) => t.status === "weak").slice(0, 5);

    const overallAccuracy =
      topicData.topics.length > 0
        ? Math.round(
            topicData.topics.reduce((sum, t) => sum + t.accuracy, 0) /
              topicData.topics.length
          )
        : 0;

    return {
      strong,
      weak,
      overallAccuracy,
      totalTopicsAttempted: topicData.topics.length,
      totalTests: topicData.totalTests,
    };
  }
}
