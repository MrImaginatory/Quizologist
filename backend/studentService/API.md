# Student Service API Documentation

Base URL: `http://localhost:3004`

> In production, all requests should go through the API Gateway at `http://localhost:3000`.

---

## Student Endpoints (Admin Only)

### GET /api/student/list

Get all students with optional enrollment-based filtering. **Admin only.**

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| course_id | string | No | Filter by enrolled course UUID |
| subject_id | string | No | Filter by enrolled subject UUID |
| topic_id | string | No | Filter by enrolled topic UUID |
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 10, max: 100) |

**Example:** `GET /api/student/list?course_id=abc-123&page=1&limit=20`

**200 OK:**
```json
{
  "success": true,
  "message": "Students retrieved successfully",
  "data": {
    "students": [
      {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "fname": "john",
        "lname": "doe",
        "email": "john@example.com",
        "mobilenumber": "9876543210",
        "role": "student",
        "enrollmentCount": 3,
        "createdAt": "2026-07-06T13:33:56.566Z",
        "updatedAt": "2026-07-06T13:33:56.566Z"
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

**403 Forbidden:**
```json
{
  "success": false,
  "message": "You do not have permission to perform this action",
  "data": null
}
```

---

### GET /api/student/:studentId/enrollments

Get all enrollments for a specific student. **Admin only.**

**Path Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| studentId | string | Yes | UUID of the student |

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 10) |

**Example:** `GET /api/student/a1b2c3d4-e5f6-7890-abcd-ef1234567890/enrollments?page=1&limit=20`

**200 OK:**
```json
{
  "success": true,
  "message": "Student enrollments retrieved successfully",
  "data": {
    "student": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "fname": "john",
      "lname": "doe",
      "email": "john@example.com",
      "mobileNumber": "9876543210",
      "role": "student"
    },
    "enrollments": [
      {
        "id": "d4e5f6a7-...",
        "student_id": "a1b2c3d4-...",
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

**404 Not Found:**
```json
{
  "success": false,
  "message": "Student not found",
  "data": null
}
```

---

## Enrollment Endpoints

---

## POST /

Batch enroll in multiple courses, subjects, and topics in a single request.

**Headers:**
```
Content-Type: application/json
x-user-id: <uuid>
```

**Body:**
```json
{
  "enrollments": [
    { "course_id": "a1b2c3d4-..." },
    { "course_id": "a1b2c3d4-...", "subject_id": "b2c3d4e5-..." },
    { "course_id": "a1b2c3d4-...", "subject_id": "b2c3d4e5-...", "topic_id": "c3d4e5f6-..." },
    { "course_id": "d4e5f6a7-...", "subject_id": "e5f6a7b8-...", "topic_id": "f6a7b8c9-..." }
  ]
}
```

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| enrollments | array | Yes | 1-50 items per request |
| enrollments[].course_id | string | Yes | UUID, must exist |
| enrollments[].subject_id | string | No | UUID, must belong to the course |
| enrollments[].topic_id | string | No | UUID, must belong to the subject. Requires subject_id. |

**201 Created:**
```json
{
  "success": true,
  "message": "Enrolled successfully",
  "data": {
    "created": [
      {
        "id": "d4e5f6a7-...",
        "student_id": "14312853-...",
        "course": { "id": "a1b2c3d4-...", "name": "computer science" },
        "subject": { "id": "b2c3d4e5-...", "name": "data structures" },
        "topic": { "id": "c3d4e5f6-...", "name": "binary trees" }
      }
    ],
    "skipped": [
      {
        "enrollment": { "course_id": "a1b2c3d4-...", "subject_id": "b2c3d4e5-" },
        "reason": "Already enrolled"
      }
    ],
    "totalCreated": 1,
    "totalSkipped": 1
  }
}
```

**400 Bad Request — FK mismatch:**
```json
{
  "success": false,
  "message": "Subject does not belong to the specified course",
  "data": null
}
```

---

## GET /

List own enrollments (student only).

**Query Params:** `page` (default 1), `limit` (default 10, max 100)

**200 OK:**
```json
{
  "success": true,
  "message": "Enrollments retrieved successfully",
  "data": {
    "enrollments": [
      {
        "id": "d4e5f6a7-...",
        "student_id": "14312853-...",
        "course": { "id": "a1b2c3d4-...", "name": "computer science" },
        "subject": { "id": "b2c3d4e5-...", "name": "data structures" },
        "topic": { "id": "c3d4e5f6-...", "name": "binary trees" }
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

---

## GET /student/:studentId

Get enrollments for a specific student (admin/teacher only).

**Path Params:** `studentId` — UUID of the student

**Query Params:** `page`, `limit`

**200 OK:** Same structure as GET /

---

## GET /:id

Get a single enrollment by UUID.

**200 OK:** Same structure as a single enrollment from the list above.

**404 Not Found:**
```json
{
  "success": false,
  "message": "Enrollment not found",
  "data": null
}
```

---

## DELETE /:id

Unenroll (soft delete).

**200 OK:**
```json
{
  "success": true,
  "message": "Unenrolled successfully",
  "data": {
    "message": "Unenrolled successfully"
  }
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Enrollment not found",
  "data": null
}
```

---

## Batch Enrollment Rules

| Rule | Description |
|------|-------------|
| Course required | Every enrollment item must have a `course_id` |
| Subject ownership | `subject_id` must belong to the given `course_id` |
| Topic ownership | `topic_id` must belong to the given `subject_id` |
| Topic needs subject | `subject_id` is required when `topic_id` is provided |
| No duplicates | Same student + course + subject + topic combo is skipped |
| Batch size | 1-50 enrollments per request |

---

## Error Responses

| Status | Message |
|--------|---------|
| 400 | Course not found or has been deleted |
| 400 | Subject not found or has been deleted |
| 400 | Topic not found or has been deleted |
| 400 | Subject does not belong to the specified course |
| 400 | Topic does not belong to the specified subject |
| 400 | subject_id is required when topic_id is provided |
| 400 | At least one enrollment is required |
| 404 | Enrollment not found |
| 500 | Internal server error |
