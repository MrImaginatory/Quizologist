import UserSkillRating from "./userSkillRating.model";

const DEFAULT_SKILL_SCORE = 3.0;
const CORRECT_DELTA = 0.15;
const WRONG_DELTA = -0.10;
const FAST_BONUS = 0.07;
const HARD_QUESTION_BONUS = 0.05;
const EASY_QUESTION_PENALTY = -0.05;
const STREAK_MULTIPLIER = 1.2;
const STREAK_THRESHOLD = 3;
const MIN_SKILL_SCORE = 1.0;
const MAX_SKILL_SCORE = 10.0;

interface UpdateScoreInput {
  userId: string;
  isCorrect: boolean;
  questionDifficultyScore: number;
  timeTaken: number;
  totalQuestionsInTest: number;
  durationMinutes: number;
}

function clampScore(score: number): number {
  return Math.max(MIN_SKILL_SCORE, Math.min(MAX_SKILL_SCORE, score));
}

export class UserSkillRatingService {
  static async getOrCreate(userId: string): Promise<UserSkillRating> {
    const [rating] = await UserSkillRating.findOrCreate({
      where: { user_id: userId },
      defaults: {
        user_id: userId,
        skill_score: DEFAULT_SKILL_SCORE,
      },
    });
    return rating;
  }

  static async getScore(userId: string): Promise<number> {
    const rating = await this.getOrCreate(userId);
    return rating.skill_score;
  }

  static async updateScore(input: UpdateScoreInput): Promise<{ skillScore: number }> {
    const { userId, isCorrect, questionDifficultyScore, timeTaken, totalQuestionsInTest, durationMinutes } = input;

    const rating = await this.getOrCreate(userId);

    let delta = isCorrect ? CORRECT_DELTA : WRONG_DELTA;

    // Fast correct bonus: answered in less than 60% of average time per question
    const avgTimePerQuestion = (durationMinutes * 60) / totalQuestionsInTest;
    if (isCorrect && timeTaken < avgTimePerQuestion * 0.6) {
      delta += FAST_BONUS;
    }

    // Hard/easy question bonus/penalty
    if (isCorrect && questionDifficultyScore > rating.skill_score) {
      delta += HARD_QUESTION_BONUS;
    } else if (!isCorrect && questionDifficultyScore < rating.skill_score) {
      delta += EASY_QUESTION_PENALTY;
    }

    // Streak multiplier
    let newStreak = isCorrect ? rating.current_streak + 1 : 0;
    if (newStreak >= STREAK_THRESHOLD) {
      delta *= STREAK_MULTIPLIER;
    }

    const newScore = clampScore(rating.skill_score + delta);
    const newBestStreak = Math.max(rating.best_streak, newStreak);

    await rating.update({
      skill_score: Math.round(newScore * 100) / 100,
      total_answers: rating.total_answers + 1,
      correct_answers: rating.correct_answers + (isCorrect ? 1 : 0),
      current_streak: newStreak,
      best_streak: newBestStreak,
      last_answered_at: new Date(),
    });

    return { skillScore: rating.skill_score };
  }

  static async getHistory(userId: string) {
    // For now, return current rating — history can be extended with a separate log table
    const rating = await this.getOrCreate(userId);
    return {
      currentScore: rating.skill_score,
      totalAnswers: rating.total_answers,
      correctAnswers: rating.correct_answers,
      accuracy: rating.total_answers > 0
        ? Math.round((rating.correct_answers / rating.total_answers) * 100)
        : 0,
      bestStreak: rating.best_streak,
      lastAnsweredAt: rating.last_answered_at,
    };
  }
}
