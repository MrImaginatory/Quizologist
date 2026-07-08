# Test Service Plan — 5 Phases

## Overview

The Test Service manages the full test lifecycle: creation, real-time session via Socket.IO, answer tracking, disconnect handling, and result generation.

**Port: 3005**

---

## Phase 1: Foundation & Test Creation (REST Only)

**Goal:** Project setup, database models, and the ability to start a test and receive questions.

### What gets built:
- Project scaffolding (package.json, tsconfig, env, database config)
- `test_sessions` table
- `test_answers` table
- POST `/api/test/start` — create test, return questions WITHOUT correctAnswer
- GET `/api/test/:testId` — get test session details
- GET `/api/test/history` — list own test history
- Read-only models for Faculty, Subject, Topic, Question (same DB)
- Gateway routes for test service

### POST /api/test/start

**Body:**
```json
{
  "subject_id": "uuid",   // optional — null for all enrolled
  "topic_id": "uuid"      // optional — null for all enrolled
}
```

**Logic:**
1. Verify student has active enrollment for the given subject/topic
2. Fetch questions matching the enrollment scope (from questions table)
3. Generate human-readable test_id: `john_doe_mon_20260708_143000`
4. Create test_session row with status `pending`
5. Return test metadata + questions stripped of `correctAnswer`, `explanation`, `videoUrl`

**Response:**
```json
{
  "id": "uuid",
  "test_id": "john_doe_mon_20260708_143000",
  "status": "pending",
  "totalQuestions": 25,
  "questions": [
    {
      "index": 0,
      "questionId": "uuid",
      "question": "What is binary search?",
      "choices": ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
      "difficulty": "normal",
      "topicName": "binary trees",
      "subjectName": "data structures",
      "facultyName": "computer science"
    }
  ]
}
```

### Test ID Format

Pattern: `{firstName}_{lastName}_{dayAbbrev}_{YYYYMMDD}_{HHmmss}`

Examples:
- `john_doe_mon_20260708_143000`
- `jane_smith_wed_20260710_091530`

### File Structure (Phase 1)

```
backend/testService/
├── .env, .env.example, .gitignore
├── package.json, tsconfig.json, nodemon.json
└── src/
    ├── index.ts
    ├── config/
    │   ├── database.ts
    │   ├── env.ts
    │   └── associations.ts
    ├── modules/
    │   └── testSession/
    │       ├── testSession.model.ts
    │       ├── testSession.service.ts
    │       ├── testSession.controller.ts
    │       ├── testSession.routes.ts
    │       └── testSession.validation.ts
    ├── middlewares/
    │   └── gatewayUser.middleware.ts
    ├── types/
    │   └── index.ts
    └── utils/
        ├── ApiError.ts
        ├── ApiResponse.ts
        └── responseMessages.ts
```

### Dependencies (Phase 1)
- `express`, `cors`, `sequelize`, `pg`, `pg-hstore`, `zod`, `dotenv`
- `typescript`, `@types/express`, `@types/cors`, `ts-node`, `nodemon`, `tsconfig-paths`

---

## Phase 2: Socket.IO Real-Time Session

**Goal:** Active test session over Socket.IO with answer recording and disconnect tracking.

### What gets built:
- Socket.IO server attached to Express HTTP server
- JWT authentication middleware for Socket.IO connections
- Session manager for tracking active connections
- `join_test` — join a test room, recover state on reconnect
- `answer` — record answer with time taken
- `skip` — mark question as skipped
- `heartbeat` — keep-alive ping every 30s
- Disconnect detection — increment `disconnect_count`, save `last_question_index`
- Status transition: `pending` → `in_progress` on first join

### Socket.IO Events

**Connection:** `http://localhost:3005?token={jwt}`

**Client → Server:**

| Event | Payload | Description |
|-------|---------|-------------|
| `join_test` | `{ testId }` | Join test room, get state |
| `answer` | `{ testId, questionIndex, questionId, answer, timeTaken }` | Save answer |
| `skip` | `{ testId, questionIndex, questionId, timeTaken }` | Skip question |
| `heartbeat` | `{ testId, questionIndex }` | Ping every 30s |

**Server → Client:**

| Event | Payload | Description |
|-------|---------|-------------|
| `test_joined` | `{ testId, totalQuestions, currentIndex, answers }` | Session state |
| `answer_recorded` | `{ testId, questionIndex, success }` | Confirmation |
| `test_submitted` | `{ testId, result }` | Auto or manual submit |
| `error` | `{ message }` | Error |

### Disconnect Handling
1. Socket disconnect without leave → increment `disconnect_count`, save `last_question_index`
2. Rejoin → server sends `test_joined` with `currentIndex` for recovery
3. No heartbeat for 60s → mark session `abandoned`

### File Structure Additions (Phase 2)

```
src/
├── socket/
│   ├── socketServer.ts          # Socket.IO server setup + auth
│   ├── socketHandler.ts         # Event handlers
│   └── sessionManager.ts        # Active session tracking (Map)
├── modules/
│   └── testAnswer/
│       ├── testAnswer.model.ts
│       └── testAnswer.service.ts
```

### Dependencies (Phase 2)
- `socket.io`, `@types/socket.io`

---

## Phase 3: Test Submission & Results

**Goal:** Submit test, calculate score, generate detailed result with explanations.

### What gets built:
- POST `/api/test/submit/:testId` — submit via REST
- Socket.IO `submit_test` event — submit via socket
- Score calculation: `(correct / total) * 100`
- Status transition: `in_progress` → `completed`
- GET `/api/test/result/:testId` — full result with correct answers, explanations, video URLs
- Auto-submit if all questions answered

### POST /api/test/submit/:testId

**Logic:**
1. Verify test belongs to student and status is `in_progress`
2. Fetch all `test_answers` for this session
3. Compare each `selected_answer` with question's `correctAnswer`
4. Update `test_answers.is_correct` for each
5. Compute `correct`, `incorrect`, `skipped`, `attempted`, `score`
6. Update `test_session` with final stats
7. Set status to `completed`, set `completed_at`

### GET /api/test/result/:testId

**Response (only when status = completed):**
```json
{
  "id": "uuid",
  "test_id": "john_doe_mon_20260708_143000",
  "status": "completed",
  "totalQuestions": 25,
  "attempted": 22,
  "skipped": 3,
  "correct": 18,
  "incorrect": 4,
  "score": 72.00,
  "disconnectCount": 1,
  "startedAt": "...",
  "completedAt": "...",
  "questions": [
    {
      "index": 0,
      "question": "What is binary search?",
      "choices": ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
      "selectedAnswer": "O(log n)",
      "correctAnswer": "O(log n)",
      "isCorrect": true,
      "explanation": "Binary search halves...",
      "videoUrl": "https://...",
      "timeTaken": 45,
      "topicName": "binary trees",
      "subjectName": "data structures",
      "facultyName": "computer science"
    }
  ]
}
```

### Score Formula
```
score = (correct / total_questions) * 100
```

---

## Phase 4: Teacher/Admin Views & Test History

**Goal:** Teachers and admins can view student test performance.

### What gets built:
- GET `/api/test/student/:studentId` — list all tests for a student (admin/teacher)
- GET `/api/test/all` — list all tests with filters (admin only)
- Query filters: `status`, `subjectId`, `dateFrom`, `dateTo`
- Pagination support on all list endpoints

### GET /api/test/student/:studentId

**Query Params:** `page`, `limit`

**Response:**
```json
{
  "tests": [
    {
      "id": "uuid",
      "test_id": "john_doe_mon_20260708_143000",
      "status": "completed",
      "totalQuestions": 25,
      "correct": 18,
      "score": 72.00,
      "startedAt": "...",
      "completedAt": "..."
    }
  ],
  "pagination": { "total": 10, "page": 1, "limit": 10, "totalPages": 1 }
}
```

### GET /api/test/all (Admin)

**Query Params:** `page`, `limit`, `status`, `subjectId`, `dateFrom`, `dateTo`

---

## Phase 5: Cleanup, Validation & Edge Cases

**Goal:** Harden the service, add missing validations, and prepare for production.

### What gets built:
- Prevent starting a test if one is already `in_progress` for the same student
- Prevent duplicate test creation within 5 minutes for same student
- Block test start if no questions found for the enrollment scope
- Validate student enrollment before every action
- Timeout handling: auto-abandon tests older than 24 hours
- Gateway route additions for all new endpoints
- API documentation update
- Error handling improvements
- Logging for debugging

### Gateway Routes (Final)

```typescript
// Test Service
{ path: "/test/start", target: "...", auth: true, roles: ["student"], methods: ["POST"] },
{ path: "/test/submit", target: "...", auth: true, roles: ["student"], methods: ["POST"] },
{ path: "/test/history", target: "...", auth: true, roles: ["student"], methods: ["GET"] },
{ path: "/test/result", target: "...", auth: true, roles: ["student"], methods: ["GET"] },
{ path: "/test/student", target: "...", auth: true, roles: ["admin", "teacher"], methods: ["GET"] },
{ path: "/test/all", target: "...", auth: true, roles: ["admin"], methods: ["GET"] },
```

### Socket.IO goes directly to port 3005 (bypasses gateway)

---

## Dependencies (All Phases)

```
express, cors, sequelize, pg, pg-hstore, zod, dotenv, socket.io
typescript, @types/express, @types/cors, @types/socket.io, ts-node, nodemon, tsconfig-paths
```

---

## Future: Adaptive Testing (Post Phase 5)

After the core flow is stable:
- Track difficulty distribution of correct answers per test
- If >80% correct at current level → shift toward harder questions
- If <40% correct → shift toward easier questions
- Implement via question query filtering in `testSession.service.ts`
