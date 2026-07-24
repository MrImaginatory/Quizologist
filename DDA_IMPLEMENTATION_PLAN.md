# Dynamic Difficulty Adjustment (DDA) - Implementation Plan

## Overview

Implement adaptive difficulty for the QuizNew app using the **Micro-Step + Floating Window** approach. Questions get harder/easier based on user performance, but the pattern is unpredictable.

---

## The Algorithm (Simple Explanation)

Instead of rigid rules like "increase after 3 correct," we use a **hidden continuous score**:

```
User starts: skill = 3.0

Answer 1 (correct) → skill becomes 3.15
Answer 2 (correct) → skill becomes 3.30
Answer 3 (correct) → skill becomes 3.45
Answer 4 (wrong)   → skill becomes 3.35
```

When picking the next question, we don't look for "exactly 3.45 difficulty." We pick **randomly from a range** like 1.5 to 5.5. So:

- Sometimes the next question is slightly easier (2.8)
- Sometimes it's slightly harder (4.1)
- Sometimes it's just right (3.5)

The user sees: "I'm getting harder questions generally, but I can't tell when or why it happens." It feels organic, not robotic.

### Score Adjustment Rules

| Condition | Delta |
|-----------|-------|
| Correct answer | +0.15 |
| Wrong answer | -0.10 |
| Fast correct (< 60% avg time) | +0.07 bonus |
| Hard question answered correctly (above skill level) | +0.05 bonus |
| Easy question answered wrong (below skill level) | -0.05 penalty |
| Streak >= 3 correct | multiplier × 1.2 |
| Skill score range | 1.0 to 10.0 |

### Floating Window for Question Selection

```
windowSize = 2.0  // ±2.0 from current score
minDifficulty = currentScore - windowSize
maxDifficulty = currentScore + windowSize
// Query: difficulty_score BETWEEN minDifficulty AND maxDifficulty
// If not enough questions: expand window by 0.5 each retry, max 3 retries
```

### Difficulty Score Mapping

| Enum | Numeric Score |
|------|--------------|
| beginner | 1.0 |
| normal | 3.0 |
| mid | 5.0 |
| hard | 7.0 |
| expert | 9.0 |

---

## Phase 1: Database Models & Skill Rating Service

**Goal:** Create the foundation — skill rating storage and scoring logic.

### Files to Create
| File | Purpose |
|------|---------|
| `backend/testService/src/modules/userSkillRating/userSkillRating.model.ts` | User skill rating model |
| `backend/testService/src/modules/userSkillRating/userSkillRating.service.ts` | Score calculation logic |

### Files to Modify
| File | Change |
|------|--------|
| `backend/questionService/src/modules/question/question.model.ts` | Add `difficulty_score` FLOAT column |
| `backend/questionService/src/modules/question/question.service.ts` | Auto-populate `difficulty_score` from enum on create/update |
| `backend/questionService/src/modules/question/question.validation.ts` | Add `difficulty_score` to validation schema |
| `backend/testService/src/config/associations.ts` | Register UserSkillRating model |

### What to Verify
- [ ] `user_skill_ratings` table created on sync
- [ ] `difficulty_score` column added to `questions` table
- [ ] Existing questions get correct `difficulty_score` values from enum
- [ ] Scoring function returns expected values for test cases

---

## Phase 2: Adaptive Question Selection in startTest

**Goal:** When `adaptive: true`, fetch questions based on user's skill score instead of random.

### Files to Modify
| File | Change |
|------|--------|
| `backend/testService/src/modules/testSession/testSession.service.ts` | New adaptive question selection logic in `start()` method |
| `backend/testService/src/modules/testSession/testSession.model.ts` | Add `skill_score_snapshot` column |
| `backend/testService/src/modules/testSession/testSession.validation.ts` | Add `adaptive?: boolean` parameter |
| `backend/questionService/src/modules/question/question.service.ts` | Add `getQuestionsByScoreRange(min, max, filters)` method |

### Adaptive Selection Logic (in startTest)
```
1. Load user skill_score (default 3.0 if new user)
2. Window = skill_score ± 2.0
3. Query questions where difficulty_score BETWEEN window.min AND window.max
4. If not enough questions → expand window by 0.5, retry (max 3 retries)
5. Still not enough → fill remaining with random questions
6. Store skill_score_snapshot on TestSession
```

### What to Verify
- [ ] `adaptive: false` → same random behavior as before (backward compatible)
- [ ] `adaptive: true` → questions match user's skill range
- [ ] New user (score 3.0) gets mostly normal/mid questions
- [ ] High skill user gets harder questions
- [ ] Small question pool → graceful fallback to random

---

## Phase 3: Real-Time Score Updates via Socket.IO

**Goal:** Update skill score after every answer and send it to the frontend.

### Files to Modify
| File | Change |
|------|--------|
| `backend/testService/src/socket/socketHandler.ts` | After recording answer, call `UserSkillRatingService.updateScore()`, emit new score to frontend |
| `frontend/lib/api/types.ts` | Add `skill_score` to test types, `adaptive` to start test payload |
| `frontend/hooks/use-test-socket.ts` | Handle `skill_score` from `answer_recorded` event |

### Socket Flow
```
User answers question
  → socket 'answer' event fires
  → record answer in test_answers
  → IF adaptive: look up question difficulty_score
  → call UserSkillRatingService.updateScore()
  → emit answer_recorded { testId, questionIndex, success, timeRemaining, skillScore }
```

### What to Verify
- [ ] Skill score updates after each answer
- [ ] Frontend receives updated score via socket
- [ ] Score persists in database after test ends

---

## Phase 4: Frontend — Adaptive Toggle & Skill Display

**Goal:** Let users opt into adaptive mode and see their skill score during the test.

### Files to Modify
| File | Change |
|------|--------|
| `frontend/components/dialogs/start-test-dialog.tsx` | Add "Adaptive Difficulty" toggle (default: ON) |
| `frontend/components/test/test-screen.tsx` | Display current skill score as subtle indicator |
| `frontend/lib/api/types.ts` | Update StartTestData interface with `adaptive` field |

### UI Changes
- **Start Test Dialog:** Toggle switch labeled "Adaptive Difficulty" with tooltip explaining it
- **Test Screen:** Small badge showing "Skill: 4.2" in the header area, updates in real-time
- **Difficulty badge:** Already exists, stays as-is (shows individual question difficulty)

### What to Verify
- [ ] Toggle appears in start test dialog
- [ ] Adaptive toggle sends `adaptive: true/false` to API
- [ ] Skill score visible during test, updates live
- [ ] Mobile and desktop layouts both work

---

## Phase 5: Dashboard Analytics & Guides

**Goal:** Add skill rating to dashboard and create documentation.

### Files to Modify
| File | Change |
|------|--------|
| `backend/dashboardService/src/modules/dashboard/dashboard.routes.ts` | New `GET /api/dashboard/student/skill-rating` endpoint |
| `backend/dashboardService/src/modules/dashboard/studentAnalytics.service.ts` | `getSkillRating()` and `getSkillHistory()` methods |

### Guides to Create
| File | Purpose |
|------|---------|
| `docs/DIFFICULTY_ALGORITHM.md` | Detailed guide on the Micro-Step + Floating Window algorithm, math, parameters |
| `docs/DDA_IMPLEMENTATION_GUIDE.md` | Overall guide: what was built, how it works, architecture, how to maintain/extend |

### What to Verify
- [ ] Dashboard shows current skill rating
- [ ] Skill history available for trend display
- [ ] Both guides are complete and accurate

---

## Post-Phase 5: Upgrade Path to Elo

When the app has 1000+ users and 500+ questions, replace the micro-step scoring with Elo:

```
E_A = 1 / (1 + 10^((R_B - R_A) / 400))
R_A' = R_A + K * (1 - E_A)   // correct
R_A' = R_A + K * (0 - E_A)   // wrong
```

No frontend changes needed — the score is still a number.

---

## Redis / Caching (Optional)

If we need caching for skill scores (high traffic), use **Podman** to run Redis in a container:

```
podman run -d --name quiz-redis -p 6379:6379 redis:alpine
```

Cache skill scores with 5-minute TTL to reduce DB reads. Not needed in Phase 1-4 — add only if performance requires it.
