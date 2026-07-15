# API Gateway Documentation

Base URL: `http://localhost:3000`

All requests go through the gateway. It handles authentication, role-based access control, and proxies to the correct downstream service.

---

## Authentication

Most endpoints require a Bearer token:

```
Authorization: Bearer <jwt_token>
```

Obtain a token via `/api/user/login` or `/api/user/signup`.

---

## Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **Admin** | Full access to User management, Course, Subject, Topic, and Question endpoints |
| **Teacher** | Read access to Subject, Topic, Course. Create/update/delete Questions. Read Questions. |
| **Student** | Read access to Subject, Topic. Read Questions. |

---

## User Endpoints

### POST /api/user/signup

Register a new user. **Public — no auth required.**

**Body:**
```json
{
  "fname": "John",
  "lname": "Doe",
  "role": "student",
  "email": "john@example.com",
  "mobilenumber": "9876543210",
  "password": "secret123"
}
```

| Field | Type | Required | Values |
|-------|------|----------|--------|
| fname | string | Yes | 1-50 chars |
| lname | string | Yes | 1-50 chars |
| role | string | Yes | `"admin"`, `"student"`, `"teacher"` |
| email | string | Yes | Valid email |
| mobilenumber | string | Yes | 10-15 chars |
| password | string | Yes | 6-100 chars |

**201 Created:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "a1b2c3d4-...",
      "fname": "john",
      "lname": "doe",
      "role": "student",
      "email": "john@example.com",
      "mobilenumber": "9876543210"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### POST /api/user/login

Authenticate and receive a JWT. **Public — no auth required.**

**Body:**
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

**200 OK:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "a1b2c3d4-...",
      "fname": "john",
      "lname": "doe",
      "role": "student",
      "email": "john@example.com",
      "mobilenumber": "9876543210"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### GET /api/user

Get all users. **Admin only.**

**Query Params:** `page` (default 1), `limit` (default 10)

---

### GET /api/user/role/:role

Get users by role. **Admin only.**

**Path:** `role` = `"student"` | `"teacher"` | `"admin"`

**Query Params:** `page`, `limit`

---

### GET /api/user/:id

Get user by ID. **Admin only.**

---

### PATCH /api/user/:id/location

Assign or remove a location from a user. **Admin only.**

**Body:**
```json
{
  "location_id": "uuid"  // or null to remove
}
```

---

## Location Endpoints (Admin Only)

### POST /api/location

Create a new location.

**Body:**
```json
{
  "address_line_1": "123 Main Street",
  "address_line_2": "Suite 100",
  "landmark": "Near City Mall",
  "city": "Mumbai",
  "pincode": "400001",
  "state": "Maharashtra",
  "country": "India"
}
```

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| address_line_1 | string | Yes | 1-255 characters |
| address_line_2 | string | No | 1-255 characters |
| landmark | string | No | 1-255 characters |
| city | string | Yes | 1-100 characters |
| pincode | string | Yes | 1-10 characters |
| state | string | Yes | 1-100 characters |
| country | string | Yes | 1-100 characters (default: "India") |

**201 Created:** Returns the created location object.

---

### GET /api/location

Get all locations with pagination.

**Query Params:** `page`, `limit`

---

### GET /api/location/:id

Get a single location by UUID.

---

### PUT /api/location/:id

Update a location. Central location cannot be modified.

---

### DELETE /api/location/:id

Delete a location. Central location cannot be deleted.

---

## Course Endpoints (Admin Only)

All course endpoints require the `admin` role.

### POST /api/content/course

**Body:**
```json
{
  "name": "Computer Science",
  "description": "Course of CS and Engineering"
}
```

**201 Created:**
```json
{
  "success": true,
  "message": "Course created successfully",
  "data": {
    "id": "a1b2c3d4-...",
    "name": "computer science",
    "description": "Course of CS and Engineering"
  }
}
```

---

### GET /api/content/course

**Query Params:** `page`, `limit`

---

### GET /api/content/course/:id

---

### PUT /api/content/course/:id

**Body:** `{ "name": "Updated Name", "description": "Updated desc" }`

---

### DELETE /api/content/course/:id

---

## Subject Endpoints (Admin / Teacher / Student)

### POST /api/content/subject

**Body:**
```json
{
  "name": "Data Structures",
  "description": "Study of data structures",
  "course_id": "a1b2c3d4-..."
}
```

**201 Created:**
```json
{
  "success": true,
  "message": "Subject created successfully",
  "data": {
    "id": "b2c3d4e5-...",
    "name": "data structures",
    "description": "Study of data structures",
    "course_id": "a1b2c3d4-...",
    "course": {
      "id": "a1b2c3d4-...",
      "name": "computer science"
    }
  }
}
```

---

### GET /api/content/subject

**Query Params:** `page`, `limit`

---

### GET /api/content/subject/course/:courseId

Get all subjects under a course.

---

### GET /api/content/subject/:id

---

### PUT /api/content/subject/:id

**Body:** `{ "name": "Updated Name", "course_id": "..." }`

---

### DELETE /api/content/subject/:id

---

## Topic Endpoints (Admin / Teacher / Student)

### POST /api/content/topic

**Body:**
```json
{
  "name": "Binary Trees",
  "description": "Introduction to binary trees",
  "subject_id": "b2c3d4e5-..."
}
```

**201 Created:**
```json
{
  "success": true,
  "message": "Topic created successfully",
  "data": {
    "id": "c3d4e5f6-...",
    "name": "binary trees",
    "description": "Introduction to binary trees",
    "subject_id": "b2c3d4e5-...",
    "subject": {
      "id": "b2c3d4e5-...",
      "name": "data structures",
      "course": {
        "id": "a1b2c3d4-...",
        "name": "computer science"
      }
    }
  }
}
```

---

### GET /api/content/topic

**Query Params:** `page`, `limit`

---

### GET /api/content/topic/subject/:subjectId

Get all topics under a subject.

---

### GET /api/content/topic/:id

---

### PUT /api/content/topic/:id

**Body:** `{ "name": "Updated Name", "subject_id": "..." }`

---

### DELETE /api/content/topic/:id

---

## Question Endpoints (Admin / Teacher / Student)

### POST /api/question

Create a question. The `questionAddedBy` field is auto-populated from the JWT.

**Body (MCQ):**
```json
{
  "type": "mcq",
  "question": "What is the time complexity of binary search?",
  "choices": ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
  "correctAnswer": "O(log n)",
  "explanation": "Binary search halves the search space each step.",
  "videoUrl": "https://youtube.com/watch?v=example",
  "topic_id": "c3d4e5f6-...",
  "subject_id": "b2c3d4e5-...",
  "course_id": "a1b2c3d4-..."
}
```

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| type | string | Yes | `"mcq"` or `"descriptive"` |
| question | string | Yes | Non-empty |
| choices | string[] | Conditional | Required for MCQ, 2-5 items |
| correctAnswer | string | Yes | Must match one of the choices (MCQ) |
| explanation | string | No | Optional |
| videoUrl | string | No | Valid URL |
| topic_id | string | Yes | Valid UUID |
| subject_id | string | Yes | Valid UUID |
| course_id | string | Yes | Valid UUID |

**201 Created:** Returns the created question object.

---

### GET /api/question

Get all questions with pagination.

**Query Params:** `page` (default 1), `limit` (default 10, max 100)

---

### GET /api/question/search?q=

Search questions by text (case-insensitive).

**Query Params:** `q` (required), `page`, `limit`

---

### GET /api/question/filter

Filter questions by course, subject, and/or topic.

**Query Params:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| course_id | string | No | Filter by course UUID |
| subject_id | string | No | Filter by subject UUID |
| topic_id | string | No | Filter by topic UUID |
| page | number | No | Page number (default 1) |
| limit | number | No | Items per page (default 10) |

---

### GET /api/question/topic/:topicId

Get all questions under a specific topic.

**Query Params:** `page`, `limit`

---

### GET /api/question/import-template

Download an Excel template with pre-filled course/subject/topic names. **Admin + Teacher only.**

**Response:** Binary Excel file (`.xlsx`)

**Template columns:**
```
Course Name | Subject Name | Topic Name | Question | Option 1 | Option 2 | Option 3 | Option 4 | Option 5 | Correct Answer | Explanation | Video URL | Question Added By
```

---

### POST /api/question/bulk

Bulk import questions from an array. Each question is validated independently — valid ones are inserted, invalid ones are skipped with error reasons. **Admin + Teacher only.**

**Body:**
```json
{
  "questions": [
    {
      "type": "mcq",
      "question": "What is binary search?",
      "choices": ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
      "correctAnswer": "O(log n)",
      "topic_id": "uuid",
      "subject_id": "uuid",
      "course_id": "uuid"
    }
  ]
}
```

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| questions | array | Yes | 1-500 items |
| questions[].type | string | Yes | Must be `"mcq"` |
| questions[].question | string | Yes | Non-empty |
| questions[].choices | string[] | Yes | 2-5 non-empty strings |
| questions[].correctAnswer | string | Yes | Must match one of the choices |
| questions[].topic_id | string | Yes | UUID |
| questions[].subject_id | string | Yes | UUID |
| questions[].course_id | string | Yes | UUID |
| questions[].questionAddedBy | string | No | UUID — defaults to requesting user |

**200 OK:**
```json
{
  "success": true,
  "message": "Import complete: 47 imported, 3 failed",
  "data": {
    "totalRows": 50,
    "imported": 47,
    "failed": 3,
    "errors": [
      { "row": 5, "reason": "A question with this text already exists for this topic" },
      { "row": 12, "reason": "Correct answer does not match any provided option" }
    ]
  }
}
```

---

### GET /api/question/:id

Get a single question by UUID.

---

### PUT /api/question/:id

Update a question. Send only the fields to change.

**Body (any subset):**
```json
{
  "question": "Updated question text",
  "choices": ["A", "B", "C", "D"],
  "correctAnswer": "B"
}
```

**200 OK:** Returns the updated question object.

---

### DELETE /api/question/:id

Soft delete a question.

**200 OK:**
```json
{
  "success": true,
  "message": "Question deleted successfully",
  "data": { "message": "Question deleted successfully" }
}
```

---

## Enrollment Endpoints

### POST /api/enrollment

Enroll in courses, subjects, and topics. **Student only.**

**Body:**
```json
{
  "enrollments": [
    { "course_id": "a1b2c3d4-..." },
    { "course_id": "a1b2c3d4-...", "subject_id": "b2c3d4e5-..." }
  ]
}
```

---

### GET /api/enrollment

Get own enrollments. **Student only.**

**Query Params:** `page`, `limit`

---

### GET /api/enrollment/student/:studentId

Get enrollments for a specific student. **Admin/Teacher only.**

---

### DELETE /api/enrollment/:id

Remove an enrollment. **Student only.**

---

## Test Endpoints

### POST /api/test/start

Start a new test session. **Student only.**

**Body:**
```json
{
  "duration_minutes": 30,
  "question_limit": 45,
  "selections": [
    { "course_id": "uuid", "subject_id": "uuid", "topic_id": "uuid" }
  ]
}
```

**201 Created:** Returns test session with questions.

---

### POST /api/test/submit/:testId

Submit and grade a test. **Student only.**

---

### POST /api/test/abandon/:testId

Abandon an ongoing test. **Student only.**

---

### GET /api/test/history

Get own test history. **Student only.**

**Query Params:** `page`, `limit`

---

### GET /api/test/result/:testId

Get full result with question breakdown for a specific test. **Student only.**

---

### GET /api/test/:testId

Get test session details. **Student only.**

---

### GET /api/test/student/:studentId

Get all tests for a student. **Admin / Teacher only.**

**Query Params:** `page`, `limit`

---

### GET /api/test/student/:studentId/results

Get completed test results with full question breakdown. Students can only view their own; admin and teacher can view any.

**Path Params:** `studentId` — UUID

**Query Params:** `page`, `limit`

**200 OK:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "uuid",
        "test_id": "john_doe_mon_20260708_143000",
        "status": "completed",
        "score": 72.00,
        "totalQuestions": 25,
        "attempted": 22,
        "correct": 18,
        "incorrect": 4,
        "skipped": 3,
        "startedAt": "...",
        "completedAt": "...",
        "questions": [...]
      }
    ],
    "pagination": { "total": 10, "page": 1, "limit": 10, "totalPages": 1 }
  }
}
```

---

### GET /api/test/student/:studentId/summary

Lightweight summary for table display — no question data, just scores and stats. Students can only view their own; admin and teacher can view any.

**Path Params:** `studentId` — UUID

**Query Params:** `page`, `limit`

**200 OK:**
```json
{
  "success": true,
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
        "subjects": ["data structures"],
        "startedAt": "...",
        "completedAt": "..."
      }
    ],
    "pagination": { "total": 10, "page": 1, "limit": 10, "totalPages": 1 }
  }
}
```

---

### GET /api/test/student/:studentId/performance

Get student performance summary. **Admin / Teacher only.**

---

### GET /api/test/detail/:testId

Get full test detail with answers. **Admin / Teacher only.**

---

### GET /api/test/all

Get all tests with filters. **Admin only.**

**Query Params:** `page`, `limit`, `status`, `subjectId`, `dateFrom`, `dateTo`

---

## Student Management (Admin Only)

### GET /api/student/list

List all students with optional enrollment-based filtering. **Admin only.**

**Query Params:**

| Param | Type | Description |
|-------|------|-------------|
| course_id | string | Filter by enrolled course UUID |
| subject_id | string | Filter by enrolled subject UUID |
| topic_id | string | Filter by enrolled topic UUID |
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 10) |

**Example:** `GET /api/student/list?course_id=abc-123&limit=20`

**200 OK:**
```json
{
  "success": true,
  "message": "Students retrieved successfully",
  "data": {
    "students": [
      {
        "id": "a1b2c3d4-...",
        "fname": "john",
        "lname": "doe",
        "email": "john@example.com",
        "mobileNumber": "9876543210",
        "role": "student",
        "enrollmentCount": 3,
        "createdAt": "2026-07-06T13:33:56.566Z"
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 20,
      "totalPages": 3
    }
  }
}
```

---

### GET /api/student/:studentId/enrollments

Get all enrollments for a specific student. **Admin only.**

**Path Params:** `studentId` — UUID of the student

**Query Params:** `page`, `limit`

**Example:** `GET /api/student/a1b2c3d4-enrollments?page=1&limit=20`

**200 OK:**
```json
{
  "success": true,
  "message": "Student enrollments retrieved successfully",
  "data": {
    "student": {
      "id": "a1b2c3d4-...",
      "fname": "john",
      "lname": "doe",
      "email": "john@example.com",
      "mobileNumber": "9876543210",
      "role": "student"
    },
    "enrollments": [
      {
        "id": "d4e5f6a7-...",
        "course": { "id": "b2c3d4e5-...", "name": "computer science" },
        "subject": { "id": "c3d4e5f6-...", "name": "data structures" },
        "topic": { "id": "d4e5f6a7-...", "name": "binary trees" }
      }
    ],
    "pagination": {
      "total": 15,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  }
}
```

---

## Teacher Assignment Endpoints (Admin Only)

### GET /api/teacher/list

Get all teachers with their assignment counts. **Admin only.**

**Query Params:**

| Param | Type | Description |
|-------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 10) |

**Example:** `GET /api/teacher/list?page=1&limit=20`

**200 OK:**
```json
{
  "success": true,
  "message": "Teachers retrieved successfully",
  "data": {
    "teachers": [
      {
        "id": "a1b2c3d4-...",
        "fname": "john",
        "lname": "doe",
        "email": "john@example.com",
        "mobileNumber": "9876543210",
        "createdAt": "2026-07-06T13:34:50.631Z",
        "courseCount": 2,
        "subjectCount": 5,
        "totalAssignments": 7
      }
    ],
    "pagination": {
      "total": 11,
      "page": 1,
      "limit": 10,
      "totalPages": 2
    }
  }
}
```

---

### POST /api/teacher/assign/course

Assign a course to a teacher.

**Body:**
```json
{
  "teacher_id": "uuid",
  "course_id": "uuid"
}
```

**201 Created:** Returns the assignment object.

---

### POST /api/teacher/assign/subject

Assign a subject to a teacher.

**Body:**
```json
{
  "teacher_id": "uuid",
  "course_id": "uuid",
  "subject_id": "uuid"
}
```

**201 Created:** Returns the assignment object.

---

### DELETE /api/teacher/:id

Remove a teacher assignment.

---

### GET /api/teacher

List all teacher assignments with filters.

**Query Params:** `teacher_id`, `course_id`, `page`, `limit`

---

### GET /api/teacher/teacher/:teacherId

Get all assignments for a specific teacher. **Admin and Teacher.**

---

## Dashboard Endpoints

### GET /api/dashboard/stats

Get dashboard statistics based on user role. **All authenticated users.**

Returns different KPI data depending on the user's role:

**Admin KPIs:**
- `testsSubmitted` — Total completed tests
- `totalQuestions` — Total questions in system
- `totalTopics` — Total topics in system
- `topicsCovered` — Topics that have at least one question
- `studentsCount` — Total registered students
- `totalSubjects` — Total subjects in system
- `totalTeachers` — Total registered teachers

**Teacher KPIs:**
- `questionsAdded` — Questions created by this teacher
- `studentsInCourses` — Students enrolled in teacher's assigned courses
- `testsSubmitted` — Tests completed by students in teacher's courses
- `questionsInCourses` — Total questions in teacher's assigned courses

**Student KPIs:**
- `questionsInEnrolledCourses` — Questions in student's enrolled courses
- `testsSubmitted` — Tests completed by this student

---

## Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Validation failed",
  "data": null
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Token is required",
  "data": null
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "You do not have permission to perform this action",
  "data": null
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Route not found",
  "data": null
}
```

**503 Service Unavailable:**
```json
{
  "success": false,
  "message": "Service unavailable",
  "data": null
}
```

---

## Socket.IO Proxy

The gateway proxies WebSocket connections to the test service. Frontend clients connect through the gateway instead of directly to the test service.

### Connection

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  path: "/socket.io",
  auth: { token: "eyJhbGciOiJIUzI1NiIs..." }
});
```

### How It Works

1. Client sends HTTP upgrade request to `GET /socket.io/?token=xxx`
2. Gateway verifies the JWT token
3. If valid, gateway pipes the raw TCP connection to the test service
4. If invalid, gateway rejects with 401 and destroys the socket
5. All subsequent Socket.IO traffic flows through the gateway transparently

### Authentication

Token can be provided via:
- `auth: { token: "..." }` — Socket.IO standard
- Query param: `/socket.io/?token=xxx`
- Authorization header: `Authorization: Bearer xxx`

### Nginx Configuration

For production with Nginx in front of the gateway:

```nginx
# REST API
location /api/ {
    proxy_pass http://gateway:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

# Socket.IO
location /socket.io/ {
    proxy_pass http://gateway:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_read_timeout 86400;
}
```
