# Dashboard Service API Documentation

Base URL: `http://localhost:3007/api/dashboard`

> In production, all requests should go through the API Gateway at `http://localhost:3000/api/dashboard`.

---

## Authentication

All endpoints require a Bearer token or gateway headers (`x-user-id`, `x-user-email`, `x-user-role`).

```
Authorization: Bearer <jwt_token>
```

---

## GET /stats — Dashboard KPI Stats

Get dashboard statistics based on the authenticated user's role. Returns different KPI data for admin, teacher, and student.

**Query Params:** None

---

### 200 OK (Admin)

```json
{
  "success": true,
  "message": "Dashboard stats retrieved successfully",
  "data": {
    "role": "admin",
    "testsSubmitted": 1248,
    "totalQuestions": 3542,
    "totalTopics": 486,
    "topicsCovered": 312,
    "studentsCount": 892,
    "totalSubjects": 19,
    "totalTeachers": 11,
    "usersByLocation": [
      { "id": "b2c3d4e5-...", "city": "Mumbai", "state": "Maharashtra", "user_count": 45 },
      { "id": "c3d4e5f6-...", "city": "Delhi", "state": "Delhi", "user_count": 32 },
      { "id": "d4e5f6a7-...", "city": "Bangalore", "state": "Karnataka", "user_count": 28 }
    ]
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| testsSubmitted | number | Total completed tests across all students |
| totalQuestions | number | Total active questions in the system |
| totalTopics | number | Total active topics |
| topicsCovered | number | Topics that have at least one question |
| studentsCount | number | Total registered students |
| totalSubjects | number | Total active subjects |
| totalTeachers | number | Total registered teachers |
| usersByLocation | array | User count grouped by location |
| usersByLocation[].id | string | Location UUID |
| usersByLocation[].city | string | City name |
| usersByLocation[].state | string | State name |
| usersByLocation[].user_count | number | Number of users assigned to this location |

---

### 200 OK (Teacher)

```json
{
  "success": true,
  "message": "Dashboard stats retrieved successfully",
  "data": {
    "role": "teacher",
    "questionsAdded": 156,
    "studentsInCourses": 234,
    "testsSubmitted": 567,
    "questionsInCourses": 892
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| questionsAdded | number | Questions created by this teacher |
| studentsInCourses | number | Unique students enrolled in teacher's assigned courses |
| testsSubmitted | number | Tests completed by students in teacher's courses |
| questionsInCourses | number | Total questions in teacher's assigned courses |

---

### 200 OK (Student)

```json
{
  "success": true,
  "message": "Dashboard stats retrieved successfully",
  "data": {
    "role": "student",
    "questionsInEnrolledCourses": 450,
    "testsSubmitted": 12
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| questionsInEnrolledCourses | number | Questions in courses the student is enrolled in |
| testsSubmitted | number | Tests this student has completed |

---

## Student Analytics Endpoints

All student analytics endpoints use the authenticated user's ID. Students can only view their own analytics.

---

## GET /student/topic-performance — Topic Performance

Get accuracy and average time per topic. Only topics with at least 3 attempts are included.

**Query Params:** None

**200 OK:**
```json
{
  "success": true,
  "message": "Topic performance retrieved",
  "data": {
    "topics": [
      {
        "topicId": "uuid",
        "topicName": "binary trees",
        "subjectName": "data structures",
        "totalAttempts": 15,
        "correctAnswers": 12,
        "accuracy": 80,
        "avgTimePerQuestion": 45,
        "status": "strong"
      }
    ],
    "totalTests": 10
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| topicId | string | UUID of the topic |
| topicName | string | Name of the topic |
| subjectName | string | Name of the parent subject |
| totalAttempts | number | Total questions answered for this topic |
| correctAnswers | number | Correct answers |
| accuracy | number | Accuracy percentage (0-100) |
| avgTimePerQuestion | number | Average time per question in seconds |
| status | string | `"strong"` (≥80%), `"moderate"` (≥50%), `"weak"` (<50%) — only if ≥3 attempts |

**Status thresholds:**
- `strong`: accuracy ≥ 80%
- `moderate`: accuracy ≥ 50%
- `weak`: accuracy < 50%
- Topics with fewer than 3 attempts are excluded

---

## GET /student/subject-performance — Subject Performance

Get accuracy and average time per subject. Only subjects with at least 3 attempts are included.

**Query Params:** None

**200 OK:**
```json
{
  "success": true,
  "message": "Subject performance retrieved",
  "data": {
    "subjects": [
      {
        "subjectId": "uuid",
        "subjectName": "data structures",
        "totalAttempts": 30,
        "correctAnswers": 24,
        "accuracy": 80,
        "avgTimePerQuestion": 42,
        "status": "strong"
      }
    ],
    "totalTests": 10
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| subjectId | string | UUID of the subject |
| subjectName | string | Name of the subject |
| totalAttempts | number | Total questions answered for this subject |
| correctAnswers | number | Correct answers |
| accuracy | number | Accuracy percentage (0-100) |
| avgTimePerQuestion | number | Average time per question in seconds |
| status | string | `"strong"`, `"moderate"`, or `"weak"` |

---

## GET /student/difficulty-breakdown — Difficulty Breakdown

Get accuracy grouped by question difficulty level.

**Query Params:** None

**200 OK:**
```json
{
  "success": true,
  "message": "Difficulty breakdown retrieved",
  "data": {
    "difficulties": [
      {
        "level": "normal",
        "totalAttempts": 50,
        "correctAnswers": 35,
        "accuracy": 70
      },
      {
        "level": "hard",
        "totalAttempts": 20,
        "correctAnswers": 8,
        "accuracy": 40
      }
    ],
    "totalTests": 10
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| level | string | `"beginner"`, `"normal"`, `"mid"`, `"hard"`, `"expert"` |
| totalAttempts | number | Questions answered at this difficulty |
| correctAnswers | number | Correct answers at this difficulty |
| accuracy | number | Accuracy percentage (0-100) |

---

## GET /student/time-analysis — Time Analysis

Get average time per question grouped by topic. Only topics with at least 3 attempts are included.

**Query Params:** None

**200 OK:**
```json
{
  "success": true,
  "message": "Time analysis retrieved",
  "data": {
    "topics": [
      {
        "topicId": "uuid",
        "topicName": "binary trees",
        "avgTime": 52,
        "totalQuestions": 15
      }
    ],
    "totalTests": 10
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| topicId | string | UUID of the topic |
| topicName | string | Name of the topic |
| avgTime | number | Average time per question in seconds |
| totalQuestions | number | Total questions answered for this topic |

Results are sorted by avgTime descending (slowest topics first).

---

## GET /student/performance-trends — Performance Trends

Get score trends over 15, 30, and 60 day windows.

**Query Params:** None

**200 OK:**
```json
{
  "success": true,
  "message": "Performance trends retrieved",
  "data": {
    "last15Days": [
      {
        "testId": "uuid",
        "score": 72.00,
        "correct": 18,
        "incorrect": 4,
        "totalQuestions": 25,
        "date": "2026-07-08T14:30:00.000Z"
      }
    ],
    "last30Days": [
      {
        "testId": "uuid",
        "score": 68.00,
        "correct": 17,
        "incorrect": 5,
        "totalQuestions": 25,
        "date": "2026-06-25T10:00:00.000Z"
      }
    ],
    "last60Days": [
      {
        "testId": "uuid",
        "score": 72.00,
        "correct": 18,
        "incorrect": 4,
        "totalQuestions": 25,
        "date": "2026-07-08T14:30:00.000Z"
      }
    ]
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| last15Days | array | Completed tests from the last 15 days |
| last30Days | array | Completed tests from the last 30 days |
| last60Days | array | Completed tests from the last 60 days |

Each entry contains:

| Field | Type | Description |
|-------|------|-------------|
| testId | string | UUID of the test session |
| score | number | Score percentage (0-100) |
| correct | number | Correct answers count |
| incorrect | number | Incorrect answers count |
| totalQuestions | number | Total questions in the test |
| date | string | ISO timestamp of when the test was created |

Results are sorted by date ascending (oldest first).

---

## GET /student/strengths-weaknesses — Strengths & Weaknesses

Get top 5 strongest and top 5 weakest topics with overall accuracy.

**Query Params:** None

**200 OK:**
```json
{
  "success": true,
  "message": "Strengths and weaknesses retrieved",
  "data": {
    "strong": [
      {
        "topicId": "uuid",
        "topicName": "binary trees",
        "subjectName": "data structures",
        "totalAttempts": 15,
        "correctAnswers": 14,
        "accuracy": 93,
        "avgTimePerQuestion": 35,
        "status": "strong"
      }
    ],
    "weak": [
      {
        "topicId": "uuid",
        "topicName": "graph algorithms",
        "subjectName": "algorithms",
        "totalAttempts": 10,
        "correctAnswers": 3,
        "accuracy": 30,
        "avgTimePerQuestion": 75,
        "status": "weak"
      }
    ],
    "overallAccuracy": 72,
    "totalTopicsAttempted": 12,
    "totalTests": 10
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| strong | array | Top 5 topics with highest accuracy (status: "strong") |
| weak | array | Top 5 topics with lowest accuracy (status: "weak") |
| overallAccuracy | number | Average accuracy across all topics (0-100) |
| totalTopicsAttempted | number | Total topics with ≥3 attempts |
| totalTests | number | Total completed tests |

Each entry in `strong` and `weak` has the same shape as the topic performance object.

---

## Error Responses

| Status | Message |
|--------|---------|
| 400 | Invalid role |
| 401 | Token is required |
| 403 | You do not have permission to perform this action |
| 500 | Internal server error |

---

## Notes

- All student analytics endpoints use the authenticated user's ID — students can only view their own data
- Topics and subjects with fewer than 3 attempts are excluded from performance calculations
- The `status` field in topic/subject performance uses these thresholds:
  - `strong`: accuracy ≥ 80%
  - `moderate`: accuracy ≥ 50%
  - `weak`: accuracy < 50%
- Performance trends return empty arrays if no completed tests exist in the time window
- Strengths/weaknesses return empty arrays if no topics meet the minimum attempt threshold
