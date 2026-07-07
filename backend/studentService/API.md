# Student Service API Documentation

Base URL: `http://localhost:3004/api/enrollment`

> In production, all requests should go through the API Gateway at `http://localhost:3000/api/enrollment`.

---

## POST /

Enroll in a faculty, subject, or topic.

**Headers:**
```
Content-Type: application/json
x-user-id: <uuid>
```

**Body — Faculty level:**
```json
{
  "faculty_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

**Body — Subject level:**
```json
{
  "faculty_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "subject_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901"
}
```

**Body — Topic level:**
```json
{
  "faculty_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "subject_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "topic_id": "c3d4e5f6-a7b8-9012-cdef-123456789012"
}
```

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| faculty_id | string | Yes | UUID, must exist |
| subject_id | string | No | UUID, must belong to the given faculty |
| topic_id | string | No | UUID, must belong to the given subject. Requires subject_id. |

**201 Created:**
```json
{
  "success": true,
  "message": "Enrolled successfully",
  "data": {
    "id": "d4e5f6a7-b8c9-0123-def4-567890abcdef",
    "student_id": "14312853-91cc-473b-9516-5265e7d6f4c7",
    "faculty_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "subject_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "topic_id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "faculty": { "id": "a1b2c3d4-...", "name": "computer science" },
    "subject": { "id": "b2c3d4e5-...", "name": "data structures" },
    "topic": { "id": "c3d4e5f6-...", "name": "binary trees" }
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

**409 Conflict — Already enrolled:**
```json
{
  "success": false,
  "message": "Already enrolled in this combination",
  "data": null
}
```

---

## GET /

List all enrollments for the authenticated student.

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
        "faculty_id": "a1b2c3d4-...",
        "subject_id": null,
        "topic_id": null,
        "faculty": { "id": "a1b2c3d4-...", "name": "computer science" },
        "subject": null,
        "topic": null
      },
      {
        "id": "e5f6a7b8-...",
        "student_id": "14312853-...",
        "faculty_id": "a1b2c3d4-...",
        "subject_id": "b2c3d4e5-...",
        "topic_id": "c3d4e5f6-...",
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

## Validation Rules Summary

| Rule | Description |
|------|-------------|
| Faculty required | `faculty_id` must reference an existing, non-deleted faculty |
| Subject ownership | `subject_id` must belong to the given `faculty_id` |
| Topic ownership | `topic_id` must belong to the given `subject_id` |
| Topic needs subject | `subject_id` is required when `topic_id` is provided |
| No duplicates | Same student + faculty + subject + topic combination is blocked |

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
| 404 | Enrollment not found |
| 409 | Already enrolled in this combination |
| 500 | Internal server error |
