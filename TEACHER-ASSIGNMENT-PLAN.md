# Teacher Assignment & Data Access Plan

## Feature 1: Bulk Subject Assignment

### Endpoint: `POST /api/teacher/assign/bulk-subjects`

Assign multiple subjects (or all subjects in a course) to a teacher in one call. **Admin and Teacher.**

**Request Body:**
```json
{
  "teacher_id": "uuid",
  "course_id": "uuid",
  "subject_ids": ["uuid1", "uuid2"]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| teacher_id | string | Yes | UUID of the teacher |
| course_id | string | Yes | UUID of the course |
| subject_ids | string[] | No | Specific subject UUIDs. If omitted, assigns ALL subjects in the course. |

**Behavior:**
- If `subject_ids` is provided → assign only those subjects
- If `subject_ids` is omitted → fetch all subjects for the course and assign each
- Skip duplicates silently (if teacher already assigned to a subject)
- Return summary of what was created vs skipped

**Response:**
```json
{
  "success": true,
  "message": "Bulk assignment completed",
  "data": {
    "total": 15,
    "created": 12,
    "skipped": 3,
    "assignments": [
      { "id": "uuid", "teacher_id": "...", "course_id": "...", "subject_id": "..." }
    ]
  }
}
```

### Files Changed

| File | Change |
|------|--------|
| `teacherAssignment.service.ts` | Added `bulkAssignSubjects()` method |
| `teacherAssignment.controller.ts` | Added `bulkAssignSubjects` handler |
| `teacherAssignment.validation.ts` | Added `bulkAssignSubjectsSchema` |
| `teacherAssignment.routes.ts` | Added `POST /assign/bulk-subjects` |
| `teacherService/API.md` | Documented new endpoint |
| `apiGateway/routes.ts` | Added route proxy (admin + teacher) |

---

## Feature 2: Teacher Data Access by Course/Subject

Let teachers query students, test results, and enrollments filtered by the courses/subjects they teach.

### Endpoint: `GET /api/teacher/teaching/students`

Get all students enrolled in the teacher's assigned courses/subjects. **Admin and Teacher.**

**Query Params:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| course_id | string | No | Filter further by specific course |
| subject_id | string | No | Filter further by specific subject |
| page | number | No | Default 1 |
| limit | number | No | Default 10 |

**Behavior:**
1. Fetch the teacher's assigned courses and subjects from `teacher_assignments`
2. Find all enrollments matching those courses/subjects
3. Return the students from those enrollments

**Response:**
```json
{
  "success": true,
  "data": {
    "students": [
      {
        "id": "uuid",
        "fname": "john",
        "lname": "doe",
        "email": "john@doe.com",
        "course_id": "...",
        "subject_id": "..."
      }
    ],
    "pagination": { "total": 50, "page": 1, "limit": 10, "totalPages": 5 }
  }
}
```

### Endpoint: `GET /api/teacher/teaching/tests`

Get test results for students in the teacher's courses/subjects. **Admin and Teacher.**

**Query Params:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| course_id | string | No | Filter by course |
| subject_id | string | No | Filter by subject |
| status | string | No | Filter by test status |
| page | number | No | Default 1 |
| limit | number | No | Default 10 |

**Behavior:**
1. Resolve teacher's assigned courses/subjects
2. Find enrollments for those courses/subjects
3. Find test sessions for those students
4. Return test data with student info

### Files Changed

| File | Change |
|------|--------|
| `teacherAssignment.service.ts` | Added `getTeachingStudents()` and `getTeachingTests()` |
| `teacherAssignment.controller.ts` | Added handlers |
| `teacherAssignment.validation.ts` | Added validation schemas |
| `teacherAssignment.routes.ts` | Added `GET /teaching/students`, `GET /teaching/tests` |
| `teacherService/API.md` | Documented new endpoints |
| `apiGateway/routes.ts` | Added route proxy (admin + teacher) |

---

## Feature 3: Teacher Enrollment Route Rename

Renamed `GET /` to `GET /teacher-enrollment` for clarity.

### Files Changed

| File | Change |
|------|--------|
| `teacherAssignment.routes.ts` | Renamed route to `/teacher-enrollment` |
| `apiGateway/routes.ts` | Updated proxy path |
| `teacherService/API.md` | Updated documentation |

---

## Route Summary

| Method | Gateway Path | Service Path | Roles |
|--------|-------------|--------------|-------|
| GET | `/teacher/list` | `/api/teacher/list` | admin |
| POST | `/teacher/assign/course` | `/api/teacher/assign/course` | admin |
| POST | `/teacher/assign/subject` | `/api/teacher/assign/subject` | admin |
| POST | `/teacher/assign/bulk-subjects` | `/api/teacher/assign/bulk-subjects` | admin, teacher |
| DELETE | `/teacher/unenroll/:id` | `/api/teacher/unenroll/:id` | admin |
| GET | `/teacher/teacher-enrollment` | `/api/teacher/teacher-enrollment` | admin |
| GET | `/teacher/teacher/:teacherId` | `/api/teacher/teacher/:teacherId` | admin, teacher |
| GET | `/teacher/teaching/students` | `/api/teacher/teaching/students` | admin, teacher |
| GET | `/teacher/teaching/tests` | `/api/teacher/teaching/tests` | admin, teacher |

---

## Execution Order

1. Bulk subject assignment endpoint ✅
2. Teacher data access endpoints (students + tests) ✅
3. Update API.md for both ✅
4. Update gateway routes ✅
5. Rename teacher-enrollment route ✅
