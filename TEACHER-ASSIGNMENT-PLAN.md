# Teacher Assignment & Data Access Plan

## Feature 1: Bulk Subject Assignment

### New Endpoint: `POST /api/teacher/assign/bulk-subjects`

Assign multiple subjects (or all subjects in a course) to a teacher in one call.

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

### Files to Change

| File | Change |
|------|--------|
| `teacherAssignment.service.ts` | Add `bulkAssignSubjects()` method |
| `teacherAssignment.controller.ts` | Add `bulkAssignSubjects` handler |
| `teacherAssignment.validation.ts` | Add `bulkAssignSubjectsSchema` |
| `teacherAssignment.routes.ts` | Add `POST /assign/bulk-subjects` |
| `teacherService/API.md` | Document new endpoint |
| `apiGateway/routes.ts` | Add route proxy |

---

## Feature 2: Teacher Data Access by Course/Subject

Let teachers query students, test results, and enrollments filtered by the courses/subjects they teach.

### New Endpoint: `GET /api/teacher/teaching/students`

Get all students enrolled in the teacher's assigned courses/subjects.

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
        "course": { "id": "...", "name": "Computer Science" },
        "subject": { "id": "...", "name": "Data Structures" }
      }
    ],
    "pagination": { "total": 50, "page": 1, "limit": 10, "totalPages": 5 }
  }
}
```

### New Endpoint: `GET /api/teacher/teaching/tests`

Get test results for students in the teacher's courses/subjects.

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

### Implementation Approach

Two options:

**Option A: New endpoints in teacherService (Recommended)**
- Add `/teaching/students` and `/teaching/tests` to teacherService
- teacherService queries enrollment + test tables directly
- Pro: Clean separation, teacher-specific logic in one place
- Con: Cross-service data access (teacherService reads enrollment/test tables)

**Option B: Proxy through existing services**
- Add query params to existing student/test endpoints
- Gateway passes teacher context, downstream services filter
- Pro: No cross-service reads
- Con: More complex, changes existing endpoints

**Recommendation: Option A** — simpler to implement, self-contained.

### Files to Change (Option A)

| File | Change |
|------|--------|
| `teacherAssignment.service.ts` | Add `getTeachingStudents()` and `getTeachingTests()` |
| `teacherAssignment.controller.ts` | Add handlers |
| `teacherAssignment.routes.ts` | Add `GET /teaching/students`, `GET /teaching/tests` |
| `teacherService/API.md` | Document new endpoints |
| `apiGateway/routes.ts` | Add route proxies |

---

## Execution Order

1. Bulk subject assignment endpoint
2. Teacher data access endpoints (students + tests)
3. Update API.md for both
4. Update gateway routes
5. Test end-to-end

---

## Gateway Routes to Add

```typescript
// Bulk assign subjects
{
  path: "/teacher/assign/bulk-subjects",
  target: `${env.TEACHER_SERVICE_URL}/api/teacher/assign/bulk-subjects`,
  auth: true,
  roles: ["admin"],
  methods: ["POST"],
},
// Teaching data — teacher sees their own students/tests
{
  path: "/teacher/teaching",
  target: `${env.TEACHER_SERVICE_URL}/api/teacher/teaching`,
  auth: true,
  roles: ["admin", "teacher"],
},
```
