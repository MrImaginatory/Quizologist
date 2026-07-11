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
| **Admin** | Full access to User management, Faculty, Subject, Topic, and Question endpoints |
| **Teacher** | Read access to Subject, Topic, Faculty. Create/update/delete Questions. Read Questions. |
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

## Faculty Endpoints (Admin Only)

All faculty endpoints require the `admin` role.

### POST /api/content/faculty

**Body:**
```json
{
  "name": "Computer Science",
  "description": "Faculty of CS and Engineering"
}
```

**201 Created:**
```json
{
  "success": true,
  "message": "Faculty created successfully",
  "data": {
    "id": "a1b2c3d4-...",
    "name": "computer science",
    "description": "Faculty of CS and Engineering"
  }
}
```

---

### GET /api/content/faculty

**Query Params:** `page`, `limit`

---

### GET /api/content/faculty/:id

---

### PUT /api/content/faculty/:id

**Body:** `{ "name": "Updated Name", "description": "Updated desc" }`

---

### DELETE /api/content/faculty/:id

---

## Subject Endpoints (Admin / Teacher / Student)

### POST /api/content/subject

**Body:**
```json
{
  "name": "Data Structures",
  "description": "Study of data structures",
  "faculty_id": "a1b2c3d4-..."
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
    "faculty_id": "a1b2c3d4-...",
    "faculty": {
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

### GET /api/content/subject/faculty/:facultyId

Get all subjects under a faculty.

---

### GET /api/content/subject/:id

---

### PUT /api/content/subject/:id

**Body:** `{ "name": "Updated Name", "faculty_id": "..." }`

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
      "faculty": {
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
  "faculty_id": "a1b2c3d4-..."
}
```

**Body (Descriptive):**
```json
{
  "type": "descriptive",
  "question": "Explain the working of a binary search tree.",
  "correctAnswer": "A BST is a binary tree where left child < parent < right child.",
  "explanation": "BST allows efficient lookup, insertion, and deletion.",
  "topic_id": "c3d4e5f6-...",
  "subject_id": "b2c3d4e5-...",
  "faculty_id": "a1b2c3d4-..."
}
```

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| type | string | Yes | `"mcq"` or `"descriptive"` |
| question | string | Yes | Non-empty |
| choices | string[] | Conditional | Required for MCQ, 2-5 items. Must be null/absent for descriptive. |
| correctAnswer | string | Yes | Must match one of the choices (MCQ) |
| explanation | string | No | Optional |
| videoUrl | string | No | Valid URL |
| topic_id | string | Yes | Valid UUID |
| subject_id | string | Yes | Valid UUID |
| faculty_id | string | Yes | Valid UUID |

**201 Created:**
```json
{
  "success": true,
  "message": "Question created successfully",
  "data": {
    "id": "d4e5f6a7-...",
    "type": "mcq",
    "question": "What is the time complexity of binary search?",
    "choices": ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
    "correctAnswer": "O(log n)",
    "explanation": "Binary search halves the search space each step.",
    "videoUrl": "https://youtube.com/watch?v=example",
    "topic_id": "c3d4e5f6-...",
    "subject_id": "b2c3d4e5-...",
    "faculty_id": "a1b2c3d4-...",
    "questionAddedBy": "14312853-..."
  }
}
```

---

### GET /api/question

Get all questions with pagination.

**Query Params:** `page` (default 1), `limit` (default 10)

**200 OK:**
```json
{
  "success": true,
  "message": "Questions retrieved successfully",
  "data": {
    "questions": [
      {
        "id": "d4e5f6a7-...",
        "type": "mcq",
        "question": "What is the time complexity of binary search?",
        "choices": ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
        "correctAnswer": "O(log n)",
        "explanation": "Binary search halves the search space each step.",
        "videoUrl": "https://youtube.com/watch?v=example",
        "topic_id": "c3d4e5f6-...",
        "subject_id": "b2c3d4e5-...",
        "faculty_id": "a1b2c3d4-...",
        "questionAddedBy": "14312853-..."
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

---

### GET /api/question/search?q=

Search questions by text (case-insensitive).

**Query Params:** `q` (required), `page`, `limit`

**Example:** `GET /api/question/search?q=binary&page=1&limit=10`

---

### GET /api/question/topic/:topicId

Get all questions under a specific topic.

**Query Params:** `page`, `limit`

---

### GET /api/question/:id

Get a single question by UUID.

---

### PUT /api/question/:id

Update a question.

**Body (any subset):**
```json
{
  "question": "Updated question text",
  "choices": ["A", "B", "C", "D"],
  "correctAnswer": "B"
}
```

**200 OK:**
```json
{
  "success": true,
  "message": "Question updated successfully",
  "data": {
    "id": "d4e5f6a7-...",
    "type": "mcq",
    "question": "Updated question text",
    "choices": ["A", "B", "C", "D"],
    "correctAnswer": "B",
    ...
  }
}
```

---

### DELETE /api/question/:id

Soft delete a question.

**200 OK:**
```json
{
  "success": true,
  "message": "Question deleted successfully",
  "data": {
    "message": "Question deleted successfully"
  }
}
```

---

## Enrollment Endpoints

### POST /api/enrollment

Enroll in faculties, subjects, and topics. **Student only.**

**Body:**
```json
{
  "enrollments": [
    { "faculty_id": "a1b2c3d4-..." },
    { "faculty_id": "a1b2c3d4-...", "subject_id": "b2c3d4e5-..." }
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

## Student Management (Admin Only)

### GET /api/student/list

List all students with optional enrollment-based filtering. **Admin only.**

**Query Params:**

| Param | Type | Description |
|-------|------|-------------|
| faculty_id | string | Filter by enrolled faculty UUID |
| subject_id | string | Filter by enrolled subject UUID |
| topic_id | string | Filter by enrolled topic UUID |
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 10) |

**Example:** `GET /api/student/list?faculty_id=abc-123&limit=20`

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
        "faculty": { "id": "b2c3d4e5-...", "name": "computer science" },
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
        "facultyCount": 2,
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

### POST /api/teacher/assign/faculty

Assign a faculty to a teacher.

**Body:**
```json
{
  "teacher_id": "uuid",
  "faculty_id": "uuid"
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
  "faculty_id": "uuid",
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

**Query Params:** `teacher_id`, `faculty_id`, `page`, `limit`

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
- `studentsInFaculties` — Students enrolled in teacher's assigned faculties
- `testsSubmitted` — Tests completed by students in teacher's faculties
- `questionsInFaculties` — Total questions in teacher's assigned faculties

**Student KPIs:**
- `questionsInEnrolledFaculties` — Questions in student's enrolled faculties
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
