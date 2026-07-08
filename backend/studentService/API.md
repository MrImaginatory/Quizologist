# Student Service API Documentation

Base URL: `http://localhost:3004/api/enrollment`

> In production, all requests should go through the API Gateway at `http://localhost:3000/api/enrollment`.

---

## POST /

Batch enroll in multiple faculties, subjects, and topics in a single request.

**Headers:**
```
Content-Type: application/json
x-user-id: <uuid>
```

**Body:**
```json
{
  "enrollments": [
    { "faculty_id": "a1b2c3d4-..." },
    { "faculty_id": "a1b2c3d4-...", "subject_id": "b2c3d4e5-..." },
    { "faculty_id": "a1b2c3d4-...", "subject_id": "b2c3d4e5-...", "topic_id": "c3d4e5f6-..." },
    { "faculty_id": "d4e5f6a7-...", "subject_id": "e5f6a7b8-...", "topic_id": "f6a7b8c9-..." }
  ]
}
```

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| enrollments | array | Yes | 1-50 items per request |
| enrollments[].faculty_id | string | Yes | UUID, must exist |
| enrollments[].subject_id | string | No | UUID, must belong to the faculty |
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
        "faculty": { "id": "a1b2c3d4-...", "name": "computer science" },
        "subject": { "id": "b2c3d4e5-...", "name": "data structures" },
        "topic": { "id": "c3d4e5f6-...", "name": "binary trees" }
      }
    ],
    "skipped": [
      {
        "enrollment": { "faculty_id": "a1b2c3d4-...", "subject_id": "b2c3d4e5-..." },
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
  "message": "Subject does not belong to the specified faculty",
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
        "faculty": { "id": "a1b2c3d4-...", "name": "computer science" },
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
| Faculty required | Every enrollment item must have a `faculty_id` |
| Subject ownership | `subject_id` must belong to the given `faculty_id` |
| Topic ownership | `topic_id` must belong to the given `subject_id` |
| Topic needs subject | `subject_id` is required when `topic_id` is provided |
| No duplicates | Same student + faculty + subject + topic combo is skipped |
| Batch size | 1-50 enrollments per request |

---

## Error Responses

| Status | Message |
|--------|---------|
| 400 | Faculty not found or has been deleted |
| 400 | Subject not found or has been deleted |
| 400 | Topic not found or has been deleted |
| 400 | Subject does not belong to the specified faculty |
| 400 | Topic does not belong to the specified subject |
| 400 | subject_id is required when topic_id is provided |
| 400 | At least one enrollment is required |
| 404 | Enrollment not found |
| 500 | Internal server error |
