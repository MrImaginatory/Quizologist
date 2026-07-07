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
