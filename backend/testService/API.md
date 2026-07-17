# Test Service API Documentation

Base URL: `http://localhost:3005/api/test`

> In production, all REST requests go through the API Gateway at `http://localhost:3000/api/test`. Socket.IO also connects through the API Gateway at `http://localhost:3000`.

---

## Authentication

All endpoints require a Bearer token or gateway headers (`x-user-id`, `x-user-email`, `x-user-role`).

---

## Duration & Question Limits

| Duration (min) | Min Questions | Max Questions |
|----------------|---------------|---------------|
| 15 | 15 | 30 |
| 20 | 20 | 40 |
| 25 | 25 | 50 |
| 30 | 30 | 60 |
| 40 | 30 | 80 |
| 45 | 40 | 120 |

---

## REST Endpoints

### POST /start

Start a new test session with multiple course/subject/topic selections.

**Body:**
```json
{
  "duration_minutes": 30,
  "question_limit": 45,
  "selections": [
    { "course_id": "uuid", "subject_id": "uuid", "topic_id": "uuid" },
    { "course_id": "uuid", "subject_id": "uuid" },
    { "course_id": "uuid" }
  ]
}
```

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| duration_minutes | number | Yes | One of: 15, 20, 25, 30, 40, 45 |
| question_limit | number | Yes | Must be within min/max for selected duration |
| selections | array | Yes | 1-200 selections, each with course_id required |
| selections[].course_id | string | Yes | UUID, must have enrollment |
| selections[].subject_id | string | No | UUID, must have enrollment |
| selections[].topic_id | string | No | UUID, must have enrollment |

**201 Created:**
```json
{
  "success": true,
  "message": "Test started successfully",
  "data": {
    "id": "uuid",
    "test_id": "john_doe_mon_20260708_143000",
    "status": "in_progress",
    "duration_minutes": 30,
    "question_limit": 45,
    "ends_at": "2026-07-08T15:00:00Z",
    "totalQuestions": 42,
    "questions": [
      {
        "index": 0,
        "questionId": "uuid",
        "question": "What is binary search?",
        "choices": ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
        "difficulty": "normal",
        "topicName": "binary trees",
        "subjectName": "data structures",
        "courseName": "computer science"
      }
    ]
  }
}
```

**400 Bad Request:**
```json
{
  "success": false,
  "message": "You are not enrolled in the selected course/subject/topic"
}
```

**400 Bad Request (no questions):**
```json
{
  "success": false,
  "message": "No questions found for the selected scope"
}
```

**409 Conflict:**
```json
{
  "success": false,
  "message": "You already have an active test. Complete or abandon it before starting a new one."
}
```

---

### POST /submit/:testId

Submit and grade the test.

**Path Params:** `testId` — UUID of the test session

**200 OK:**
```json
{
  "success": true,
  "message": "Test submitted successfully",
  "data": {
    "id": "uuid",
    "test_id": "john_doe_mon_20260708_143000",
    "status": "completed",
    "totalQuestions": 25,
    "attempted": 22,
    "skipped": 3,
    "correct": 18,
    "incorrect": 4,
    "score": 72.00
  }
}
```

**400 Bad Request:**
```json
{
  "success": false,
  "message": "This test has already been submitted"
}
```

---

### POST /abandon/:testId

Abandon an ongoing test. **Student only.**

**Path Params:** `testId` — UUID of the test session

**200 OK:**
```json
{
  "success": true,
  "message": "Test abandoned successfully",
  "data": {
    "id": "uuid",
    "test_id": "john_doe_mon_20260708_143000",
    "status": "abandoned"
  }
}
```

**400 Bad Request:**
```json
{
  "success": false,
  "message": "This test has already been completed"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Test not found"
}
```

---

### GET /result/:testId

Get full result with correct answers and explanations. Only works after test is completed.

**Path Params:** `testId` — UUID

**200 OK:**
```json
{
  "success": true,
  "message": "Result retrieved successfully",
  "data": {
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
    "startedAt": "2026-07-08T14:30:00.000Z",
    "completedAt": "2026-07-08T15:00:00.000Z",
    "questions": [
      {
        "index": 0,
        "question": "What is binary search?",
        "choices": ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
        "selectedAnswer": "O(log n)",
        "correctAnswer": "O(log n)",
        "isCorrect": true,
        "explanation": "Binary search halves the search space each step.",
        "videoUrl": "https://youtube.com/watch?v=example",
        "timeTaken": 45,
        "topicName": "binary trees",
        "subjectName": "data structures",
        "courseName": "computer science"
      }
    ]
  }
}
```

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Test has not been completed yet"
}
```

---

### GET /:testId

Get test session details.

**Path Params:** `testId` — UUID

**200 OK:**
```json
{
  "success": true,
  "message": "Test retrieved successfully",
  "data": {
    "id": "uuid",
    "test_id": "john_doe_mon_20260708_143000",
    "status": "completed",
    "totalQuestions": 25,
    "attempted": 22,
    "correct": 18,
    "score": 72.00
  }
}
```

---

### GET /history

Get own test history (student only).

**Query Params:** `page` (default 1), `limit` (default 10)

**200 OK:**
```json
{
  "success": true,
  "message": "Tests retrieved successfully",
  "data": {
    "tests": [
      {
        "id": "uuid",
        "test_id": "john_doe_mon_20260708_143000",
        "status": "completed",
        "totalQuestions": 25,
        "correct": 18,
        "score": 72.00,
        "startedAt": "..."
      }
    ],
    "pagination": {
      "total": 10,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

---

### GET /student/:studentId

Get all tests for a student (admin/teacher only).

**Path Params:** `studentId` — UUID

**Query Params:** `page`, `limit`

**200 OK:** Same structure as /history

---

### GET /student/:studentId/results

Get completed test results with full question breakdown for a specific student. Students can only view their own results; admin and teacher can view any student's results.

**Path Params:** `studentId` — UUID

**Query Params:**

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| page | number | No | 1 | Page number |
| limit | number | No | 10 | Items per page (max 100) |

**200 OK:**
```json
{
  "success": true,
  "message": "Student results retrieved successfully",
  "data": {
    "results": [
      {
        "id": "uuid",
        "test_id": "john_doe_mon_20260708_143000",
        "student_id": "uuid",
        "status": "completed",
        "totalQuestions": 25,
        "attempted": 22,
        "skipped": 3,
        "correct": 18,
        "incorrect": 4,
        "score": 72.00,
        "startedAt": "2026-07-08T14:30:00.000Z",
        "completedAt": "2026-07-08T15:00:00.000Z",
        "questions": [
          {
            "index": 0,
            "question": "What is binary search?",
            "choices": ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
            "selectedAnswer": "O(log n)",
            "correctAnswer": "O(log n)",
            "isCorrect": true,
            "explanation": "Binary search halves the search space each step.",
            "videoUrl": "https://youtube.com/watch?v=example",
            "timeTaken": 45,
            "topicName": "binary trees",
            "subjectName": "data structures",
            "courseName": "computer science"
          }
        ]
      }
    ],
    "pagination": {
      "total": 10,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "You can only view your own results",
  "data": null
}
```

---

### GET /student/:studentId/summary

Get a lightweight summary of completed test results for table display. No question-level data — just scores, stats, and scope info. Students can only view their own summary; admin and teacher can view any.

**Path Params:** `studentId` — UUID

**Query Params:**

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| page | number | No | 1 | Page number |
| limit | number | No | 10 | Items per page (max 100) |

**200 OK:**
```json
{
  "success": true,
  "message": "Student result summary retrieved successfully",
  "data": {
    "results": [
      {
        "id": "uuid",
        "testId": "john_doe_mon_20260708_143000",
        "score": 72.00,
        "accuracy": 72,
        "totalQuestions": 25,
        "attempted": 22,
        "correct": 18,
        "incorrect": 4,
        "skipped": 3,
        "durationMinutes": 30,
        "disconnects": 1,
        "courses": ["computer science"],
        "subjects": ["data structures", "algorithms"],
        "startedAt": "2026-07-08T14:30:00.000Z",
        "completedAt": "2026-07-08T15:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 10,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

---

### GET /student/:studentId/performance

Get student performance summary (admin/teacher only).

**Path Params:** `studentId` — UUID

**200 OK:**
```json
{
  "success": true,
  "message": "Student performance retrieved successfully",
  "data": {
    "studentId": "uuid",
    "totalTests": 10,
    "averageScore": 72.50,
    "highestScore": 95.00,
    "lowestScore": 45.00,
    "totalQuestions": 250,
    "totalCorrect": 180,
    "totalIncorrect": 50,
    "totalSkipped": 20
  }
}
```

---

### GET /detail/:testId

Get full test detail with answers (admin/teacher only).

**Path Params:** `testId` — UUID

**200 OK:** Same structure as /result

---

### GET /all

Get all tests with filters (admin only).

**Query Params:**

| Param | Type | Description |
|-------|------|-------------|
| page | number | Default 1 |
| limit | number | Default 10, max 100 |
| status | string | `pending`, `in_progress`, `completed`, `abandoned` |
| subjectId | string | UUID filter |
| dateFrom | string | ISO date string |
| dateTo | string | ISO date string |

**200 OK:** Same structure as /history

---

## Socket.IO

Connect through the API Gateway at `http://localhost:3000` with JWT token. The gateway authenticates and proxies the connection to this service.

**Connection (through gateway):**
```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  path: "/socket.io",
  auth: { token: "eyJhbGciOiJIUzI1NiIs..." }
});
```

**Direct connection (development only):**
```javascript
const socket = io("http://localhost:3005", {
  auth: { token: "eyJhbGciOiJIUzI1NiIs..." }
});
```

### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `join_test` | `{ testId }` | Join test room, get state |
| `answer` | `{ testId, questionIndex, questionId, answer, timeTaken }` | Record answer |
| `skip` | `{ testId, questionIndex, questionId, timeTaken }` | Skip question |
| `submit_test` | `{ testId }` | Submit and grade test |
| `heartbeat` | `{ testId, questionIndex }` | Keep-alive ping (send every 30s) |

### Server → Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `test_joined` | `{ testId, totalQuestions, currentIndex, timeRemaining, endsAt }` | Session state on join |
| `answer_recorded` | `{ testId, questionIndex, success, timeRemaining }` | Answer confirmation |
| `time_update` | `{ timeRemaining }` | Seconds remaining (from heartbeat) |
| `test_submitted` | `{ testId, result, reason? }` | Submission result (reason: "timeout" if auto-submit) |
| `error` | `{ message }` | Any error |

### Example Flow

```javascript
// 1. Join test
socket.emit("join_test", { testId: "uuid" });

// 2. Listen for confirmation with timer info
socket.on("test_joined", (data) => {
  console.log(`Test started, ${data.totalQuestions} questions`);
  console.log(`Time remaining: ${data.timeRemaining} seconds`);
  console.log(`Ends at: ${data.endsAt}`);
});

// 3. Record answer
socket.emit("answer", {
  testId: "uuid",
  questionIndex: 0,
  questionId: "uuid",
  answer: "O(log n)",
  timeTaken: 45
});

// 4. Skip question
socket.emit("skip", {
  testId: "uuid",
  questionIndex: 2,
  questionId: "uuid",
  timeTaken: 10
});

// 5. Heartbeat every 30s (also gets time_update)
setInterval(() => {
  socket.emit("heartbeat", { testId: "uuid", questionIndex: currentIndex });
}, 30000);

// 6. Listen for time updates
socket.on("time_update", (data) => {
  console.log(`Time remaining: ${data.timeRemaining}s`);
});

// 7. Submit test
socket.emit("submit_test", { testId: "uuid" });

// 8. Get result (includes timeout auto-submit)
socket.on("test_submitted", (data) => {
  console.log(`Score: ${data.result.score}%`);
  if (data.reason === "timeout") {
    console.log("Test was auto-submitted due to timeout");
  }
});
```

---

## Validation Rules

| Rule | Description |
|------|-------------|
| Active test check | Cannot start if one is already `pending` or `in_progress` |
| Rate limit | Cannot create another test within 5 minutes |
| Auto-abandon | Tests older than 24 hours are marked `abandoned` |
| Enrollment required | Must be enrolled in each selected course/subject/topic |
| Questions required | At least 1 question must exist for the selected scope |
| Only owner | Student can only submit/view their own tests |
| Duration validation | Must be one of: 15, 20, 25, 30, 40, 45 minutes |
| Question limit | Must be within min/max for selected duration |
| Question availability | If available questions < limit, use all available (no repeats) |
| Server-side timer | Test auto-submits when `ends_at` is reached |

---

## Error Responses

| Status | Message |
|--------|---------|
| 400 | You are not enrolled in the selected course/subject/topic |
| 400 | No questions found for the selected scope |
| 400 | Test has not been completed yet |
| 400 | This test has already been submitted |
| 400 | This test has been abandoned |
| 404 | Test not found |
| 409 | You already have an active test |
| 409 | Please wait 5 minutes before creating another test |
| 500 | Internal server error |

---

## Predefined Test Endpoints

Base URL: `http://localhost:3005/api/test/predefined`

---

### POST / — Create Predefined Test

Create a new predefined test. **Admin and Teacher only.**

**Body:**
```json
{
  "title": "Midterm Exam - Direct Tax Laws",
  "description": "Covers chapters 1-5",
  "is_scheduled": true,
  "start_time": "2026-07-20T10:00:00Z",
  "end_time": "2026-07-20T14:00:00Z",
  "timezone": "Asia/Kolkata",
  "duration_minutes": 30,
  "question_limit": 30,
  "difficulty": "mixed",
  "use_fixed_questions": false,
  "max_attempts": 1,
  "course_ids": ["uuid1"],
  "subject_ids": ["uuid2"],
  "topic_ids": ["uuid3"],
  "student_ids": ["student1"],
  "fixed_question_ids": ["q1", "q2"]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Test name (max 255 chars) |
| description | string | No | Optional description |
| is_scheduled | boolean | No | Default: false |
| start_time | datetime | No | Required if is_scheduled |
| end_time | datetime | No | Required if is_scheduled, must be after start_time |
| timezone | string | No | Default: "UTC" |
| duration_minutes | number | Yes | 15-120 minutes |
| question_limit | number | Yes | 1-200 questions |
| difficulty | string | No | beginner, normal, mid, hard, expert, mixed (default: normal) |
| use_fixed_questions | boolean | No | Default: false |
| max_attempts | number | No | 1-10 (default: 1) |
| course_ids | string[] | Yes | At least one course |
| subject_ids | string[] | No | Filter subjects |
| topic_ids | string[] | No | Filter topics |
| student_ids | string[] | No | Specific students (optional) |
| fixed_question_ids | string[] | No | Required if use_fixed_questions=true |

**201 Created:**
```json
{
  "success": true,
  "message": "Predefined test created successfully",
  "data": {
    "id": "uuid",
    "title": "Midterm Exam",
    "status": "draft",
    "test_link_token": "abc123...",
    ...
  }
}
```

---

### GET / — List Predefined Tests

Get all predefined tests. **Admin sees all, Teacher sees own.**

**Query Params:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| page | number | No | Default: 1 |
| limit | number | No | Default: 10 |
| status | string | No | draft, active, inactive, archived |
| course_id | string | No | Filter by course |

**200 OK:**
```json
{
  "success": true,
  "message": "Predefined tests retrieved successfully",
  "data": {
    "tests": [...],
    "pagination": { "total": 25, "page": 1, "limit": 10, "totalPages": 3 }
  }
}
```

---

### GET /pending — Get Pending Tests (Student)

Get tests available to the current student. **Student only.**

**200 OK:**
```json
{
  "success": true,
  "message": "Pending tests retrieved successfully",
  "data": {
    "tests": [
      {
        "id": "uuid",
        "title": "Midterm Exam",
        "duration_minutes": 30,
        "question_limit": 30,
        "status": "upcoming",
        ...
      }
    ]
  }
}
```

---

### GET /join/:token — Get Test Info by Link

Get test information from a shareable link. **Student only (requires login).**

**Path Params:** `token` — Shareable link token

**200 OK:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Midterm Exam",
    "duration_minutes": 30,
    "question_limit": 30,
    "difficulty": "mixed"
  }
}
```

---

### GET /:id — Get Predefined Test Details

Get test details with questions and assigned students. **Admin, Teacher, Student.**

---

### PUT /:id — Update Predefined Test

Update test configuration. **Admin and Teacher (draft/active only).**

---

### DELETE /:id — Delete Predefined Test

Soft delete a test. **Admin and Teacher.**

---

### POST /:id/activate — Activate Test

Change status from draft to active. **Admin and Teacher.**

---

### POST /:id/deactivate — Deactivate Test

Change status from active to inactive. **Admin and Teacher.**

---

### POST /:id/start — Start Predefined Test

Start a predefined test session. **Student only.**

**201 Created:**
```json
{
  "success": true,
  "message": "Test started successfully",
  "data": {
    "id": "session-uuid",
    "test_id": "PREDEFINED_abc123_...",
    "status": "in_progress",
    "duration_minutes": 30,
    "ends_at": "2026-07-20T10:30:00Z",
    "totalQuestions": 30,
    "questions": [...]
  }
}
```

---

### Predefined Test Error Responses

| Status | Message |
|--------|---------|
| 400 | start_time and end_time are required when is_scheduled is true |
| 400 | start_time must be before end_time |
| 400 | fixed_question_ids are required when use_fixed_questions is true |
| 400 | Test is not active |
| 400 | Test has not started yet |
| 400 | Test has ended |
| 400 | Maximum attempts reached |
| 400 | Can only activate tests in draft status |
| 400 | Can only deactivate tests in active status |
| 403 | You do not have permission to view/update/delete this test |
| 404 | Predefined test not found |
| 404 | Test not found or inactive |
| 500 | Internal server error |
