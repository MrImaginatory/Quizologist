import { Op, fn, col, literal } from "sequelize";
import TestSession from "../testSession/testSession.model";
import TestAnswer from "../testAnswer/testAnswer.model";
import Question from "../question/question.model";
import Topic from "../topic/topic.model";
import Subject from "../subject/subject.model";
import Course from "../course/course.model";
import UserSkillRating from "../userSkillRating/userSkillRating.model";
import { env } from "../../config/env";
import { redisService } from "../../services/redis.service";

const MIN_ATTEMPTS = env.MIN_ATTEMPTS;

export class StudentAnalyticsService {
  static async getTopicPerformance(studentId: string) {
    const cacheKey = `topic_perf_${studentId}`;
    const cached = await redisService.getCache<any>(cacheKey);
    if (cached) return cached;

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
          as: "question",
          attributes: ["topic_id", "subject_id", "difficulty"],
          include: [
            { model: Topic, as: "topic", attributes: ["id", "name"] },
            { model: Subject, as: "subject", attributes: ["id", "name"] },
          ],
        },
      ],
    });

    const topicMap = new Map<
      string,
      { name: string; subjectName: string; correct: number; total: number; totalTime: number }
    >();

    for (const answer of answers) {
      const q = (answer as any).question;
      if (!q || !q.topic) continue;

      const topicId = q.topic_id;
      const topicName = q.topic.name;
      const subjectName = q.subject?.name || "";

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
      if ((answer as any).is_correct) topic.correct++;
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
      .filter((t) => t.totalAttempts >= 1)
      .sort((a, b) => a.accuracy - b.accuracy);

    const result = {
      topics,
      totalTests: completedTests.length,
    };

    await redisService.setCache(cacheKey, result, 300);
    return result;
  }

  static async getSubjectPerformance(studentId: string) {
    const cacheKey = `subject_perf_${studentId}`;
    const cached = await redisService.getCache<any>(cacheKey);
    if (cached) return cached;
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
          as: "question",
          attributes: ["subject_id"],
          include: [{ model: Subject, as: "subject", attributes: ["id", "name"] }],
        },
      ],
    });

    const subjectMap = new Map<
      string,
      { name: string; correct: number; total: number; totalTime: number }
    >();

    for (const answer of answers) {
      const q = (answer as any).question;
      if (!q || !q.subject) continue;

      const subjectId = q.subject_id;
      const subjectName = q.subject.name;

      if (!subjectMap.has(subjectId)) {
        subjectMap.set(subjectId, { name: subjectName, correct: 0, total: 0, totalTime: 0 });
      }

      const subject = subjectMap.get(subjectId)!;
      subject.total++;
      if ((answer as any).is_correct) subject.correct++;
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
      .filter((s) => s.totalAttempts >= 1)
      .sort((a, b) => a.accuracy - b.accuracy);

    return {
      subjects,
      totalTests: completedTests.length,
    };
  }

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
          as: "question",
          attributes: ["difficulty"],
        },
      ],
    });

    const diffMap = new Map<string, { correct: number; total: number }>();

    for (const answer of answers) {
      const q = (answer as any).question;
      if (!q) continue;

      const diff = q.difficulty || "normal";
      if (!diffMap.has(diff)) {
        diffMap.set(diff, { correct: 0, total: 0 });
      }

      const d = diffMap.get(diff)!;
      d.total++;
      if ((answer as any).is_correct) d.correct++;
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
          as: "question",
          attributes: ["topic_id"],
          include: [{ model: Topic, as: "topic", attributes: ["id", "name"] }],
        },
      ],
    });

    const timeMap = new Map<string, { name: string; totalTime: number; count: number }>();

    for (const answer of answers) {
      const q = (answer as any).question;
      if (!q || !q.topic) continue;

      const topicId = q.topic_id;
      const topicName = q.topic.name;

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

  static async getPerformanceTrends(studentId: string) {
    const cacheKey = `perf_trends_${studentId}`;
    const cached = await redisService.getCache<any>(cacheKey);
    if (cached) return cached;

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
        attributes: ["id", "score", "correct", "incorrect", "total_questions", "createdAt"],
      });

      return tests.map((t) => ({
        testId: t.id,
        score: parseFloat(String(t.score)),
        correct: t.correct,
        incorrect: t.incorrect,
        totalQuestions: t.total_questions,
        date: t.createdAt,
      }));
    };

    const [trend15, trend30, trend60] = await Promise.all([
      getTrend(d15),
      getTrend(d30),
      getTrend(d60),
    ]);

    const result = {
      last15Days: trend15,
      last30Days: trend30,
      last60Days: trend60,
    };

    await redisService.setCache(cacheKey, result, 300);
    return result;
  }

  static async getStrengthsWeaknesses(studentId: string) {
    const topicData = await this.getTopicPerformance(studentId);

    const strong = topicData.topics.filter((t: any) => t.status === "strong").slice(0, 5);
    const weak = topicData.topics.filter((t: any) => t.status === "weak").slice(0, 5);

    const overallAccuracy =
      topicData.topics.length > 0
        ? Math.round(
            topicData.topics.reduce((sum: number, t: any) => sum + t.accuracy, 0) /
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

  static async getSkillRating(studentId: string) {
    const rating = await UserSkillRating.findOne({
      where: { user_id: studentId },
    });

    if (!rating) {
      return {
        skillScore: 3.0,
        totalAnswers: 0,
        correctAnswers: 0,
        accuracy: 0,
        currentStreak: 0,
        bestStreak: 0,
        lastAnsweredAt: null,
      };
    }

    return {
      skillScore: rating.skill_score,
      totalAnswers: rating.total_answers,
      correctAnswers: rating.correct_answers,
      accuracy: rating.total_answers > 0
        ? Math.round((rating.correct_answers / rating.total_answers) * 100)
        : 0,
      currentStreak: rating.current_streak,
      bestStreak: rating.best_streak,
      lastAnsweredAt: rating.last_answered_at,
    };
  }

  static async getRepeatedQuestions(studentId: string) {
    const lastTest = await TestSession.findOne({
      where: { student_id: studentId, status: "completed" },
      order: [["created_at", "DESC"]],
      attributes: ["id"],
    });

    if (!lastTest) {
      return { repeatedQuestions: [] };
    }

    const answers = await TestAnswer.findAll({
      where: {
        test_session_id: lastTest.id,
        is_skipped: false,
      },
      include: [
        {
          model: Question,
          as: "question",
          attributes: ["id", "question"],
          include: [
            { model: Subject, as: "subject", attributes: ["name"] },
            { model: Topic, as: "topic", attributes: ["name"] },
          ],
        },
      ],
    });

    // Group by test_session_id + question_id
    const groupMap = new Map<
      string,
      {
        questionId: string;
        question: string;
        subjectName: string;
        topicName: string;
        totalAttempts: number;
        incorrectAttempts: number;
      }
    >();

    for (const answer of answers) {
      const q = (answer as any).question;
      if (!q) continue;

      const key = `${answer.test_session_id}_${q.id}`;

      if (!groupMap.has(key)) {
        groupMap.set(key, {
          questionId: q.id,
          question: q.question || "Unknown question text",
          subjectName: q.subject?.name || "-",
          topicName: q.topic?.name || "-",
          totalAttempts: 0,
          incorrectAttempts: 0,
        });
      }

      const group = groupMap.get(key)!;
      group.totalAttempts++;
      if ((answer as any).is_correct === false) {
        group.incorrectAttempts++;
      }
    }

    const repeatedQuestions = Array.from(groupMap.values())
      .filter((g) => g.totalAttempts > 1)
      .sort((a, b) => b.incorrectAttempts - a.incorrectAttempts || b.totalAttempts - a.totalAttempts)
      .slice(0, 10);

    return { repeatedQuestions };
  }
}
