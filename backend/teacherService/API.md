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

| Param | Type   | Required | Description                  |
| ----- | ------ | -------- | ---------------------------- |
| page  | number | No       | Page number (default: 1)     |
| limit | number | No       | Items per page (default: 10) |

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

### POST /assign/course

Assign a course to a teacher. **Admin only.**

**Headers:**

```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

**Body:**

```json
{
  "teacher_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "course_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901"
}
```

| Field      | Type   | Required | Description                                    |
| ---------- | ------ | -------- | ---------------------------------------------- |
| teacher_id | string | Yes      | UUID of the teacher (must have role "teacher") |
| course_id  | string | Yes      | UUID of the course to assign                   |

**201 Created:**

```json
{
  "success": true,
  "message": "Course assigned to teacher successfully",
  "data": {
    "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "teacher_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "course_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
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
  "message": "Teacher is already assigned to this course",
  "data": null
}
```

---

### POST /assign/subject

Assign a subject to a teacher. **Admin only.**

The subject must belong to a course that is already assigned to the teacher.

**Body:**

```json
{
  "teacher_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "course_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "subject_id": "c3d4e5f6-a7b8-9012-cdef-123456789012"
}
```

| Field      | Type   | Required | Description                                     |
| ---------- | ------ | -------- | ----------------------------------------------- |
| teacher_id | string | Yes      | UUID of the teacher                             |
| course_id  | string | Yes      | UUID of the course                              |
| subject_id | string | Yes      | UUID of the subject (must belong to the course) |

**201 Created:**

```json
{
  "success": true,
  "message": "Subject assigned to teacher successfully",
  "data": {
    "id": "d4e5f6a7-b8c9-0123-def4-567890abcdef",
    "teacher_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "course_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "subject_id": "c3d4e5f6-a7b8-9012-cdef-123456789012"
  }
}
```

**400 Bad Request:**

```json
{
  "success": false,
  "message": "Subject does not belong to the specified course",
  "data": null
}
```

---

### POST /assign/bulk-subjects

Assign multiple subjects to a teacher in one call. **Admin only.**

**Body:**

```json
{
  "teacher_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "course_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "subject_ids": ["c3d4e5f6-a7b8-9012-cdef-123456789012", "d4e5f6a7-b8c9-0123-def4-567890abcdef"]
}
```

| Field       | Type     | Required | Description                                                             |
| ----------- | -------- | -------- | ----------------------------------------------------------------------- |
| teacher_id  | string   | Yes      | UUID of the teacher                                                     |
| course_id   | string   | Yes      | UUID of the course                                                      |
| subject_ids | string[] | No       | Specific subject UUIDs. If omitted, assigns ALL subjects in the course. |

**Behavior:**

- If `subject_ids` is provided → assign only those subjects
- If `subject_ids` is omitted → fetch all subjects for the course and assign each
- Skip duplicates silently (if teacher already assigned to a subject)
- Return summary of what was created vs skipped

**201 Created:**

```json
{
  "success": true,
  "message": "Bulk assignment completed",
  "data": {
    "total": 15,
    "created": 12,
    "skipped": 3,
    "assignments": [
      {
        "id": "uuid",
        "teacher_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "course_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        "subject_id": "c3d4e5f6-a7b8-9012-cdef-123456789012"
      }
    ]
  }
}
```

---

### DELETE /unenroll/:id

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

### GET /teacher-enrollment

Get all teacher assignments with filtering. **Admin only.**

**Query Params:**

| Param      | Type   | Required | Description                  |
| ---------- | ------ | -------- | ---------------------------- |
| teacher_id | string | No       | Filter by teacher UUID       |
| course_id  | string | No       | Filter by course UUID        |
| page       | number | No       | Page number (default: 1)     |
| limit      | number | No       | Items per page (default: 10) |

**Example:** `GET /api/teacher/teacher-enrollment?teacher_id=abc-123&limit=20`

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
        "course": { "id": "b2c3d4e5-...", "name": "computer science" },
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

## Teacher Data Access Endpoints

### GET /teaching/students

Get all students enrolled in the teacher's assigned courses/subjects. **Admin and Teacher.**

When called by a teacher, automatically uses their user ID from the JWT token.

**Query Params:**

| Param      | Type   | Required | Description                        |
| ---------- | ------ | -------- | ---------------------------------- |
| course_id  | string | No       | Filter further by specific course  |
| subject_id | string | No       | Filter further by specific subject |
| student_id | string | No       | Filter by specific student UUID    |
| search     | string | No       | Search by student name or email    |
| page       | number | No       | Page number (default: 1)           |
| limit      | number | No       | Items per page (default: 10)       |

**Example:** `GET /api/teacher/teaching/students?search=john&limit=20`

**200 OK:**

```json
{
  "success": true,
  "message": "Teaching students retrieved successfully",
  "data": {
    "students": [
      {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "fname": "john",
        "lname": "doe",
        "email": "john@doe.com",
        "course_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        "subject_id": "c3d4e5f6-a7b8-9012-cdef-123456789012"
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

**Behavior:**

1. Fetch the teacher's assigned courses and subjects from `teacher_assignments`
2. Find all enrollments matching those courses/subjects
3. Return the students from those enrollments

---

### GET /teaching/tests

Get test results for students in the teacher's courses/subjects. **Admin and Teacher.**

When called by a teacher, automatically uses their user ID from the JWT token.

**Query Params:**

| Param      | Type   | Required | Description                                                        |
| ---------- | ------ | -------- | ------------------------------------------------------------------ |
| course_id  | string | No       | Filter by course                                                   |
| subject_id | string | No       | Filter by subject                                                  |
| student_id | string | No       | Filter by specific student UUID                                    |
| search     | string | No       | Search by student name or email                                    |
| status     | string | No       | Filter by test status (pending, in_progress, completed, abandoned) |
| page       | number | No       | Page number (default: 1)                                           |
| limit      | number | No       | Items per page (default: 10)                                       |

**Example:** `GET /api/teacher/teaching/tests?search=jane&status=completed&limit=20`

**200 OK:**

```json
{
  "success": true,
  "message": "Teaching tests retrieved successfully",
  "data": {
    "tests": [
      {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "test_id": "TEST-001",
        "student": {
          "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
          "fname": "jane",
          "lname": "smith",
          "email": "jane@smith.com"
        },
        "status": "completed",
        "subject_id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
        "topic_id": null,
        "total_questions": 30,
        "attempted": 28,
        "correct": 22,
        "incorrect": 6,
        "score": 78.50,
        "started_at": "2026-07-15T10:00:00Z",
        "completed_at": "2026-07-15T10:25:00Z"
      }
    ],
    "pagination": {
      "total": 120,
      "page": 1,
      "limit": 10,
      "totalPages": 12
    }
  }
}
```

**Behavior:**

1. Resolve teacher's assigned courses/subjects
2. Find enrollments for those courses/subjects
3. Find test sessions for those students
4. Return test data with student info

---

## Error Responses

| Status | Message                                           |
| ------ | ------------------------------------------------- |
| 400    | Subject does not belong to the specified course   |
| 400    | Teacher ID is required                            |
| 403    | You do not have permission to perform this action |
| 404    | Teacher not found                                 |
| 404    | Course not found                                  |
| 404    | Subject not found                                 |
| 404    | Assignment not found                              |
| 409    | Teacher is already assigned to this course        |
| 409    | Teacher is already assigned to this subject       |
| 500    | Internal server error                             |
