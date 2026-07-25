# Dynamic Difficulty Adjustment (DDA) - Implementation Guide

## Overview

This guide documents the DDA feature built into the QuizNew app. It covers architecture, file locations, how to maintain and extend the system, and troubleshooting.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend                           │
│  start-test-dialog.tsx  →  live-test/page.tsx           │
│  (adaptive toggle)       (skill badge, socket events)   │
└──────────────────────┬──────────────────────────────────┘
                       │ Socket.IO
┌──────────────────────▼──────────────────────────────────┐
│                   Backend (testService)                  │
│  testSession.service.ts  →  socketHandler.ts            │
│  (adaptive question       (skill score update           │
│   selection)               after each answer)           │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                  PostgreSQL Database                     │
│  questions.difficulty_score                              │
│  user_skill_ratings (skill_score, streaks, etc.)        │
│  test_sessions.skill_score_snapshot                     │
└─────────────────────────────────────────────────────────┘
```

---

## Key Files

### Backend (testService)

| File | Purpose |
|------|---------|
| `backend/testService/src/modules/userSkillRating/userSkillRating.model.ts` | User skill rating table |
| `backend/testService/src/modules/userSkillRating/userSkillRating.service.ts` | Score calculation engine |
| `backend/testService/src/modules/testSession/testSession.service.ts` | Adaptive question selection in `start()` |
| `backend/testService/src/modules/testSession/testSession.model.ts` | `skill_score_snapshot` column |
| `backend/testService/src/modules/testSession/testSession.validation.ts` | `adaptive` flag in start schema |
| `backend/testService/src/socket/socketHandler.ts` | Real-time score updates on answer |

### Backend (questionService)

| File | Purpose |
|------|---------|
| `backend/questionService/src/modules/question/question.model.ts` | `difficulty_score` column |
| `backend/questionService/src/modules/question/question.service.ts` | Auto-populate score, `getQuestionsByScoreRange()` |
| `backend/questionService/src/types/index.ts` | `difficulty_score` in `QuestionAttributes` |

### Backend (dashboardService)

| File | Purpose |
|------|---------|
| `backend/dashboardService/src/modules/models/index.ts` | `UserSkillRating` model (read-only) |
| `backend/dashboardService/src/modules/dashboard/studentAnalytics.service.ts` | `getSkillRating()` method |
| `backend/dashboardService/src/modules/dashboard/dashboard.routes.ts` | `GET /student/skill-rating` route |
| `backend/dashboardService/src/modules/dashboard/dashboard.controller.ts` | `getSkillRating` controller |

### Frontend

| File | Purpose |
|------|---------|
| `frontend/components/dialogs/start-test-dialog.tsx` | Adaptive Difficulty toggle |
| `frontend/app/(test)/live-test/page.tsx` | Skill score display during test |
| `frontend/components/test/test-screen.tsx` | Skill score badge (alternative test screen) |
| `frontend/hooks/use-test-socket.ts` | `skillScore` in `AnswerRecordedData` |
| `frontend/components/ui/switch.tsx` | Switch UI component |
| `frontend/lib/api/types.ts` | `SkillRatingResponse` type |
| `frontend/lib/api/dashboard.ts` | `getStudentSkillRating()` API call |
| `frontend/lib/api-routes.ts` | `STUDENT_SKILL_RATING` route |

---

## How to Maintain

### Changing Score Constants

Edit `userSkillRating.service.ts`:

```typescript
const CORRECT_DELTA = 0.15;    // Change base correct bonus
const WRONG_DELTA = -0.10;     // Change base wrong penalty
const FAST_BONUS = 0.07;       // Change fast answer bonus
const STREAK_MULTIPLIER = 1.2; // Change streak multiplier
const STREAK_THRESHOLD = 3;    // Change streak count threshold
```

### Changing Difficulty Score Mapping

Edit `question.service.ts` in questionService:

```typescript
const DIFFICULTY_SCORE_MAP: Record<string, number> = {
  beginner: 1.0,
  normal: 3.0,
  mid: 5.0,
  hard: 7.0,
  expert: 9.0,
};
```

### Changing Window Size

Edit the adaptive selection logic in `testSession.service.ts`:

```typescript
const WINDOW_SIZE = 2.0;    // Initial window (±2.0 from skill score)
const MAX_RETRIES = 3;      // Max window expansions
const WINDOW_EXPAND = 0.5;  // How much to expand per retry
```

### Changing Default Skill Score

Edit `userSkillRating.service.ts`:

```typescript
const DEFAULT_SKILL_SCORE = 3.0;
```

---

## Database Schema

### user_skill_ratings

```sql
CREATE TABLE user_skill_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  skill_score FLOAT DEFAULT 3.0,
  total_answers INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  last_answered_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### questions (new column)

```sql
ALTER TABLE questions ADD COLUMN difficulty_score FLOAT DEFAULT 3.0;
```

### test_sessions (new column)

```sql
ALTER TABLE test_sessions ADD COLUMN difficulty_score FLOAT;
```

---

## API Endpoints

### Start Test (adaptive)

```
POST /api/test/start
Body: {
  duration_minutes: 30,
  question_limit: 45,
  selections: [{ course_id: "...", subject_id: "...", topic_id: "..." }],
  adaptive: true
}
```

### Get Skill Rating

```
GET /api/dashboard/student/skill-rating
Headers: Authorization: Bearer <token>

Response: {
  success: true,
  data: {
    skillScore: 4.2,
    totalAnswers: 150,
    correctAnswers: 105,
    accuracy: 70,
    currentStreak: 3,
    bestStreak: 8,
    lastAnsweredAt: "2026-07-25T10:30:00Z"
  }
}
```

---

## Socket Events

### Answer Event (with skill update)

```typescript
// Client emits
socket.emit("answer", {
  testId: "...",
  questionIndex: 5,
  questionId: "...",
  answer: "B",
  timeTaken: 12
});

// Server responds (if adaptive)
socket.emit("answer_recorded", {
  testId: "...",
  questionIndex: 5,
  success: true,
  timeRemaining: 1200,
  skillScore: 3.45  // null if not adaptive
});
```

---

## Troubleshooting

### Questions not adapting

1. Check that `adaptive: true` is passed in the start test payload
2. Verify `difficulty_score` column exists on `questions` table
3. Check that existing questions have correct `difficulty_score` values
4. Run `ALTER TABLE questions ADD COLUMN difficulty_score FLOAT DEFAULT 3.0;` if missing

### Skill score not updating

1. Check that `user_skill_ratings` table exists
2. Verify the socket handler imports `UserSkillRatingService`
3. Check server logs for "Skill score update error"
4. Ensure `skill_score_snapshot` is not null on the test session

### No questions found in adaptive window

1. Check if questions have `difficulty_score` values
2. The window expands automatically (±2.0, then ±2.5, ±3.0, ±3.5)
3. After 3 expansions, remaining slots fill with random questions
4. Check if the question pool is too small for the selected course/subject/topic
