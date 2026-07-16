# Plan: Teacher Tests & Students Pages

## Overview
Update the tests page and create a students page for teachers using the new endpoints:
- `GET /api/teacher/teaching/tests` - Test results for students in teacher's courses
- `GET /api/teacher/teaching/students` - Students enrolled in teacher's courses

## Current State
- Tests page exists at `/dashboard/tests` using `testsApi.getAll`
- Students page directory exists but is empty
- API routes and functions already added for teaching/tests and teaching/students

## Implementation Plan

### 1. Add TypeScript Types (`lib/api.ts`)

```typescript
// Teaching Test Response
export interface TeachingTest {
  id: string;
  test_id: string;
  student: {
    id: string;
    fname: string;
    lname: string;
    email: string;
  };
  status: string;
  subject_id: string | null;
  topic_id: string | null;
  total_questions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  score: number;
  started_at: string;
  completed_at: string | null;
}

export interface TeachingTestsResponse {
  success: boolean;
  message: string;
  data: {
    tests: TeachingTest[];
    pagination: Pagination;
  };
}

// Teaching Student Response
export interface TeachingStudent {
  id: string;
  fname: string;
  lname: string;
  email: string;
  course_id: string;
  subject_id: string;
}

export interface TeachingStudentsResponse {
  success: boolean;
  message: string;
  data: {
    students: TeachingStudent[];
    pagination: Pagination;
  };
}
```

### 2. Create Hook: `use-teaching-tests.ts`

- Fetches from `teachersApi.getTeachingTests`
- Accepts filters: `course_id`, `subject_id`, `status`, `page`, `limit`
- Returns: `tests`, `total`, `totalPages`, `isLoading`, `error`, `refetch`

### 3. Create Hook: `use-teaching-students.ts`

- Fetches from `teachersApi.getTeachingStudents`
- Accepts filters: `course_id`, `subject_id`, `page`, `limit`
- Returns: `students`, `total`, `totalPages`, `isLoading`, `error`, `refetch`

### 4. Update Tests Page (`app/(dashboard)/dashboard/tests/page.tsx`)

- Check user role
- If teacher: use `useTeachingTests` hook
- If admin: use existing `useAllTests` hook
- Add course/subject filters for teachers
- Update table columns to show student info for teachers

### 5. Create Students Page (`app/(dashboard)/dashboard/students/page.tsx`)

- Display students enrolled in teacher's courses
- Show columns: #, Name, Email, Course, Subject
- Add filters for course and subject
- Add pagination

### 6. Update Test Filters Component

- Add course and subject filter props
- Add course select dropdown
- Add subject select dropdown (filtered by selected course)

## Files to Create/Modify

| File | Action |
|------|--------|
| `lib/api.ts` | Add types |
| `hooks/use-teaching-tests.ts` | Create |
| `hooks/use-teaching-students.ts` | Create |
| `app/(dashboard)/dashboard/tests/page.tsx` | Modify |
| `app/(dashboard)/dashboard/students/page.tsx` | Create |
| `components/filters/test-filters.tsx` | Modify |

## API Endpoints Used

| Endpoint | Purpose |
|----------|---------|
| `GET /api/teacher/teaching/tests` | Get test results for teacher's students |
| `GET /api/teacher/teaching/students` | Get students in teacher's courses |
| `GET /api/content/course` | Get courses for filter dropdown |
| `GET /api/content/subject` | Get subjects for filter dropdown |

## Response Formats

### Teaching Tests
```json
{
  "data": {
    "tests": [{
      "id": "uuid",
      "test_id": "TEST-001",
      "student": { "id": "uuid", "fname": "john", "lname": "doe", "email": "john@example.com" },
      "status": "completed",
      "total_questions": 30,
      "attempted": 28,
      "correct": 22,
      "score": 78.50,
      "started_at": "2026-07-15T10:00:00Z"
    }],
    "pagination": { "total": 120, "page": 1, "limit": 10, "totalPages": 12 }
  }
}
```

### Teaching Students
```json
{
  "data": {
    "students": [{
      "id": "uuid",
      "fname": "john",
      "lname": "doe",
      "email": "john@doe.com",
      "course_id": "uuid",
      "subject_id": "uuid"
    }],
    "pagination": { "total": 50, "page": 1, "limit": 10, "totalPages": 5 }
  }
}
```
