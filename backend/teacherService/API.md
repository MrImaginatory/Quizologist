# Teacher Service API Documentation

Base URL: `http://localhost:3006/api/teacher`

> In production, all requests should go through the API Gateway at `http://localhost:3000/api/teacher`.

---

## Admin Endpoints

### GET /list

Get all teachers with their assignment counts. **Admin only.**

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

**Query Params:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 10) |

**Example:** `GET /api/teacher/list?page=1&limit=20`

**200 OK:**
```json
{
  "success": true,
  "message": "Teachers retrieved successfully",
  "data": {
    "teachers": [
      {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
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

### POST /assign/faculty

Assign a faculty to a teacher. **Admin only.**

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

**Body:**
```json
{
  "teacher_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "faculty_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| teacher_id | string | Yes | UUID of the teacher (must have role "teacher") |
| faculty_id | string | Yes | UUID of the faculty to assign |

**201 Created:**
```json
{
  "success": true,
  "message": "Faculty assigned to teacher successfully",
  "data": {
    "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "teacher_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "faculty_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "subject_id": null
  }
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Teacher not found",
  "data": null
}
```

**409 Conflict:**
```json
{
  "success": false,
  "message": "Teacher is already assigned to this faculty",
  "data": null
}
```

---

### POST /assign/subject

Assign a subject to a teacher. **Admin only.**

The subject must belong to a faculty that is already assigned to the teacher.

**Body:**
```json
{
  "teacher_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "faculty_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "subject_id": "c3d4e5f6-a7b8-9012-cdef-123456789012"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| teacher_id | string | Yes | UUID of the teacher |
| faculty_id | string | Yes | UUID of the faculty |
| subject_id | string | Yes | UUID of the subject (must belong to the faculty) |

**201 Created:**
```json
{
  "success": true,
  "message": "Subject assigned to teacher successfully",
  "data": {
    "id": "d4e5f6a7-b8c9-0123-def4-567890abcdef",
    "teacher_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "faculty_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "subject_id": "c3d4e5f6-a7b8-9012-cdef-123456789012"
  }
}
```

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Subject does not belong to the specified faculty",
  "data": null
}
```

---

### DELETE /:id

Remove a teacher assignment. **Admin only.**

**Path Params:** `id` — UUID of the assignment

**200 OK:**
```json
{
  "success": true,
  "message": "Assignment removed successfully",
  "data": {
    "message": "Assignment removed successfully"
  }
}
```

---

### GET /

Get all teacher assignments with filtering. **Admin only.**

**Query Params:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| teacher_id | string | No | Filter by teacher UUID |
| faculty_id | string | No | Filter by faculty UUID |
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 10) |

**Example:** `GET /api/teacher?teacher_id=abc-123&limit=20`

**200 OK:**
```json
{
  "success": true,
  "message": "Assignments retrieved successfully",
  "data": {
    "assignments": [
      {
        "id": "c3d4e5f6-...",
        "teacher": { "id": "a1b2c3d4-...", "fname": "john", "lname": "doe", "email": "john@example.com" },
        "faculty": { "id": "b2c3d4e5-...", "name": "computer science" },
        "subject": { "id": "c3d4e5f6-...", "name": "data structures" }
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 20,
      "totalPages": 2
    }
  }
}
```

---

### GET /teacher/:teacherId

Get all assignments for a specific teacher. **Admin and Teacher.**

**Path Params:** `teacherId` — UUID of the teacher

**200 OK:**
```json
{
  "success": true,
  "message": "Teacher assignments retrieved successfully",
  "data": {
    "teacher": {
      "id": "a1b2c3d4-...",
      "fname": "john",
      "lname": "doe",
      "email": "john@example.com",
      "role": "teacher"
    },
    "assignments": [
      {
        "id": "b2c3d4e5-...",
        "name": "computer science",
        "subjects": [
          { "id": "c3d4e5f6-...", "name": "data structures" },
          { "id": "d4e5f6a7-...", "name": "algorithms" }
        ]
      }
    ]
  }
}
```

---

## Error Responses

| Status | Message |
|--------|---------|
| 400 | Subject does not belong to the specified faculty |
| 403 | You do not have permission to perform this action |
| 404 | Teacher not found |
| 404 | Faculty not found |
| 404 | Subject not found |
| 404 | Assignment not found |
| 409 | Teacher is already assigned to this faculty |
| 409 | Teacher is already assigned to this subject |
| 500 | Internal server error |
