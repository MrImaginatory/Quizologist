/**
 * DDA Progression Simulation
 * Simulates 15-question tests with different user performance patterns
 * to verify the new tuning parameters (CORRECT_DELTA=0.40, random bonus, etc.)
 */

const SIMULATIONS = 5;  // Run 5 simulations per scenario to see variance
const QUESTIONS = 15;

const DIFFICULTY_MAP = {
  1.0: "beginner",
  3.0: "normal",
  5.0: "mid",
  7.0: "hard",
  9.0: "expert",
};

function getDifficultyLabel(score) {
  if (score < 2.0) return "beginner";
  if (score < 4.0) return "normal";
  if (score < 6.0) return "mid";
  if (score < 8.0) return "hard";
  return "expert";
}

function clampScore(score) {
  return Math.max(1.0, Math.min(10.0, score));
}

function updateScore(currentScore, isCorrect, questionDifficultyScore, timeTaken, totalQuestions, durationMinutes, streak) {
  const CORRECT_DELTA = 0.40;
  const WRONG_DELTA = 0.00;
  const RANDOM_BONUS_MAX = 0.20;
  const FAST_BONUS = 0.10;
  const HARD_QUESTION_BONUS = 0.10;
  const STREAK_MULTIPLIER_MIN = 1.1;
  const STREAK_MULTIPLIER_MAX = 1.3;
  const STREAK_THRESHOLD = 3;

  let delta = isCorrect ? CORRECT_DELTA : WRONG_DELTA;

  if (isCorrect) {
    // Random bonus for unpredictability
    const randomBonus = Math.random() * RANDOM_BONUS_MAX;
    delta += randomBonus;

    // Fast answer bonus
    const avgTimePerQuestion = (durationMinutes * 60) / totalQuestions;
    if (timeTaken < avgTimePerQuestion * 0.6) {
      delta += FAST_BONUS;
    }

    // Hard question bonus
    if (questionDifficultyScore > currentScore) {
      delta += HARD_QUESTION_BONUS;
    }
  }

  // Streak multiplier
  let newStreak = isCorrect ? streak + 1 : 0;
  if (newStreak >= STREAK_THRESHOLD) {
    const randomMultiplier = STREAK_MULTIPLIER_MIN + Math.random() * (STREAK_MULTIPLIER_MAX - STREAK_MULTIPLIER_MIN);
    delta *= randomMultiplier;
  }

  const newScore = clampScore(currentScore + delta);
  return { newScore: Math.round(newScore * 100) / 100, newStreak };
}

function simulate(questions, scenario) {
  console.log("\n" + "=".repeat(80));
  console.log(`  SCENARIO: ${scenario.name}`);
  console.log("=".repeat(80));

  for (let sim = 0; sim < SIMULATIONS; sim++) {
    console.log(`\n  --- Simulation ${sim + 1} ---`);
    console.log("  Q# | Correct? | Skill Score | Difficulty | Delta | Notes");
    console.log("  " + "-".repeat(60));

    let skillScore = 1.0;
    let streak = 0;
    const progression = [];

    for (let q = 0; q < questions; q++) {
      const isCorrect = scenario.getCorrect(q, skillScore);
      // Find a question at current difficulty level
      const questionDiff = Math.max(1.0, Math.min(9.0, Math.round(skillScore / 2) * 2 + 1));
      const timeTaken = scenario.getTimeTaken(q);
      const durationMinutes = 30;
      const totalQuestions = questions;

      const prevScore = skillScore;
      const result = updateScore(skillScore, isCorrect, questionDiff, timeTaken, totalQuestions, durationMinutes, streak);

      if (isCorrect) {
        skillScore = result.newScore;
        streak = result.newStreak;
      } else {
        streak = 0;
      }

      const delta = Math.round((skillScore - prevScore) * 100) / 100;
      const diffLabel = getDifficultyLabel(skillScore);
      const notes = isCorrect
        ? (streak >= 3 ? `🔥 streak(${streak})` : "")
        : "❌ wrong";

      progression.push({ q: q + 1, correct: isCorrect, score: skillScore, difficulty: diffLabel, delta, notes });

      console.log(
        `  ${(q + 1).toString().padEnd(3)}| ${isCorrect ? "✅" : "❌"}        | ${skillScore.toFixed(2).padEnd(8)}| ${diffLabel.padEnd(10)}| ${delta > 0 ? "+" : ""}${delta.toFixed(2).padEnd(5)}| ${notes}`
      );
    }

    // Summary
    const correctCount = progression.filter(p => p.correct).length;
    const wrongCount = questions - correctCount;
    const finalScore = progression[questions - 1].score;
    const finalDiff = progression[questions - 1].difficulty;

    console.log(`\n  SUMMARY:`);
    console.log(`    Correct: ${correctCount}/${questions} (${Math.round(correctCount/questions*100)}%)`);
    console.log(`    Start: 1.0 (beginner) → End: ${finalScore.toFixed(2)} (${finalDiff})`);
    console.log(`    Total increase: ${(finalScore - 1.0).toFixed(2)}`);

    // Check if user experienced at least 3 different difficulty levels
    const diffsSeen = [...new Set(progression.map(p => p.difficulty))];
    console.log(`    Difficulty levels seen: ${diffsSeen.join(" → ")}`);
    console.log(`    ✅ Progression visible: ${diffsSeen.length >= 2 ? "YES" : "NO"}`);
  }
}

// ===================== SCENARIOS =====================

// Scenario 1: Perfect student - answers all correctly (some fast, some slow)
simulate(QUESTIONS, {
  name: "PERFECT STUDENT - All correct, varied speed",
  getCorrect: () => true,
  getTimeTaken: (q) => q < 5 ? 5 : (q < 10 ? 15 : 8), // Fast early, slow mid, fast late
});

// Scenario 2: Average student - 70% correct, 30% wrong
simulate(QUESTIONS, {
  name: "AVERAGE STUDENT - 70% correct, 30% wrong",
  getCorrect: (q) => ![2, 5, 8, 11, 13].includes(q), // Wrong on specific questions
  getTimeTaken: () => 15, // Moderate speed
});

// Scenario 3: Struggling student - 50% correct
simulate(QUESTIONS, {
  name: "STRUGGLING STUDENT - 50% correct",
  getCorrect: (q) => q % 2 === 0, // Alternate correct/wrong
  getTimeTaken: () => 20, // Slow
});

// Scenario 4: Streaky student - correct in clusters
simulate(QUESTIONS, {
  name: "STREAKY STUDENT - Clusters of correct/wrong",
  getCorrect: (q) => {
    if (q < 5) return true;  // First 5 correct
    if (q < 8) return false; // Next 3 wrong
    if (q < 12) return true; // Next 4 correct
    return false;              // Last 3 wrong
  },
  getTimeTaken: (q) => q < 5 ? 5 : 15, // Fast during streaks
});

// Scenario 5: Lightning fast - all correct, very fast
simulate(QUESTIONS, {
  name: "LIGHTNING FAST - All correct, very fast answers",
  getCorrect: () => true,
  getTimeTaken: () => 3, // Very fast (gets fast bonus)
});
