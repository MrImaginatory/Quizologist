# Dynamic Difficulty Adjustment Algorithm

## Micro-Step + Floating Window

This document describes the difficulty adjustment algorithm used in the QuizNew app.

---

## Core Concept

Instead of rigid rules like "increase after 3 correct answers," we use a **hidden continuous skill score** that adjusts in small increments after every answer. The next question is then selected from a **floating window** around that score, adding controlled randomness so the pattern feels organic.

---

## Skill Score

Each user has a `skill_score` stored in the `user_skill_ratings` table.

- **Range:** 1.0 to 10.0
- **Default:** 3.0 (new users)
- **Precision:** 2 decimal places

### Score Adjustment Rules

| Condition | Delta |
|-----------|-------|
| Correct answer | +0.15 |
| Wrong answer | -0.10 |
| Fast correct (< 60% of avg time per question) | +0.07 bonus |
| Hard question answered correctly (difficulty_score > skill_score) | +0.05 bonus |
| Easy question answered wrong (difficulty_score < skill_score) | -0.05 penalty |
| Streak >= 3 correct | multiplier x 1.2 |
| Skill score range | 1.0 to 10.0 |

### Example Flow

```
User starts: skill = 3.0

Answer 1 (correct) → skill becomes 3.15
Answer 2 (correct) → skill becomes 3.30
Answer 3 (correct) → skill becomes 3.45 (streak = 3, next answer gets 1.2x)
Answer 4 (correct, fast) → skill becomes 3.45 + (0.15 + 0.07) * 1.2 = 3.714
Answer 5 (wrong) → skill becomes 3.614
```

---

## Difficulty Score Mapping

Each question has a `difficulty_score` column derived from its difficulty enum:

| Difficulty Enum | Numeric Score |
|-----------------|---------------|
| beginner | 1.0 |
| normal | 3.0 |
| mid | 5.0 |
| hard | 7.0 |
| expert | 9.0 |

The `difficulty_score` is auto-populated when a question is created or updated. If the difficulty enum changes, the score updates automatically.

---

## Floating Window for Question Selection

When selecting questions for an adaptive test:

```
windowSize = 2.0
minDifficulty = currentScore - windowSize
maxDifficulty = currentScore + windowSize
```

### Selection Algorithm

1. Query questions where `difficulty_score` is BETWEEN `minDifficulty` AND `maxDifficulty`
2. If not enough questions found:
   - Expand window by 0.5 in each direction
   - Retry (max 3 retries)
3. If still not enough after retries:
   - Fill remaining slots with random questions from the selection

### Example

```
User skill_score = 4.5

Attempt 1: window = [2.5, 6.5] → found 18 questions (need 30)
Attempt 2: window = [2.0, 7.0] → found 27 questions (need 30)
Attempt 3: window = [1.5, 7.5] → found 35 questions → take 30
```

---

## Backward Compatibility

When `adaptive: false` (default):
- Questions are selected randomly from the pool (original behavior)
- No skill score is looked up or updated
- `skill_score_snapshot` on the test session is `null`

When `adaptive: true`:
- Questions are selected based on the floating window
- Skill score is updated after each answer via Socket.IO
- `skill_score_snapshot` records the user's score at test start

---

## Future: Elo Rating

When the app reaches 1000+ users and 500+ questions, the micro-step scoring can be replaced with Elo:

```
E_A = 1 / (1 + 10^((R_B - R_A) / 400))
R_A' = R_A + K * (1 - E_A)   // correct
R_A' = R_A + K * (0 - E_A)   // wrong
```

No frontend changes needed — the score is still a number.
