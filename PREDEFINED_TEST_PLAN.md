
# Predefined Test Creation API - Implementation Plan

## Overview

Introduce a new API endpoint that allows **Admin** and **Teacher** users to create predefined tests with configurable settings. This runs on a **separate controller** to keep it isolated from the current student-initiated test flow.

## Key Architecture Decision

**Separate Controller**: Predefined tests use `predefinedTest.controller.ts` — completely independent from the existing `testSession.controller.ts`. This ensures:

- No risk of breaking current student-initiated tests
- Future adaptive difficulty algorithm for normal tests won't affect predefined tests
- Clear separation of concerns

**Same Test-Taking Flow**: Once a student starts a predefined test, the actual test-taking (WebSocket, timer, answer submission, grading) uses the same infrastructure — just linked via `predefined_test_id`.

---

## Phase 1: Database Models

### New Model: `PredefinedTest` (`predefined_tests` table)

| Column                  | Type        | Constraints                | Description                                |
| ----------------------- | ----------- | -------------------------- | ------------------------------------------ |
| `id`                  | UUID        | PK                         | Auto-generated                             |
| `title`               | STRING(255) | NOT NULL                   | Test name                                  |
| `description`         | TEXT        | Nullable                   | Optional description                       |
| `created_by`          | UUID        | NOT NULL                   | Admin/Teacher who created                  |
| `status`              | ENUM        | NOT NULL, default "draft"  | draft, active, inactive, archived          |
| `is_scheduled`        | BOOLEAN     | NOT NULL, default false    | Whether test has time window               |
| `start_time`          | DATE        | Nullable                   | Scheduled start (UTC)                      |
| `end_time`            | DATE        | Nullable                   | Scheduled end (UTC)                        |
| `timezone`            | STRING(50)  | NOT NULL, default "UTC"    | e.g., "Asia/Kolkata"                       |
| `duration_minutes`    | INTEGER     | NOT NULL                   | 15, 20, 25, 30, 45, 60                     |
| `question_limit`      | INTEGER     | NOT NULL                   | Total questions                            |
| `difficulty`          | ENUM        | NOT NULL, default "normal" | beginner, normal, mid, hard, expert, mixed |
| `use_fixed_questions` | BOOLEAN     | NOT NULL, default false    | Fixed vs dynamic                           |
| `max_attempts`        | INTEGER     | NOT NULL, default 1        | 1 = single attempt                         |
| `course_ids`          | JSONB       | NOT NULL                   | Array of course UUIDs                      |
| `subject_ids`         | JSONB       | Nullable                   | Array of subject UUIDs                     |
| `topic_ids`           | JSONB       | Nullable                   | Array of topic UUIDs                       |
| `test_link_token`     | STRING(100) | UNIQUE                     | Shareable link token                       |
| `createdAt`           | DATE        | auto                       |                                            |
| `updatedAt`           | DATE        | auto                       |                                            |
| `deletedAt`           | DATE        | paranoid                   |                                            |

### New Model: `PredefinedTestQuestion` (`predefined_test_questions` table)

Only used when `use_fixed_questions = true`.

| Column                 | Type    | Constraints               |
| ---------------------- | ------- | ------------------------- |
| `id`                 | UUID    | PK                        |
| `predefined_test_id` | UUID    | FK → predefined_tests.id |
| `question_id`        | UUID    | FK → questions.id        |
| `order`              | INTEGER | NOT NULL                  |

### New Model: `PredefinedTestStudent` (`predefined_test_students` table)

Only used when specific students are assigned.

| Column                 | Type | Constraints                      |
| ---------------------- | ---- | -------------------------------- |
| `id`                 | UUID | PK                               |
| `predefined_test_id` | UUID | FK → predefined_tests.id        |
| `student_id`         | UUID | FK → users.id                   |
| `status`             | ENUM | assigned, started, completed     |
| `test_session_id`    | UUID | Nullable, FK → test_sessions.id |

### Modify Existing Model: `TestSession`

Add new column:

- `predefined_test_id` (UUID, Nullable) — FK → predefined_tests.id

---

## Phase 2: Backend Validation Schemas

### File: `predefinedTest.validation.ts` (NEW)

Schemas:

- `createPredefinedTestSchema` — validates all create fields
- `updatePredefinedTestSchema` — partial update
- `predefinedTestIdParamSchema` — UUID param
- `predefinedTestQuerySchema` — list/filter params
- `startPredefinedTestSchema` — student start request

---

## Phase 3: Backend Service — CRUD Operations

### File: `predefinedTest.service.ts` (NEW)

Methods:

- `create(data, createdBy)` — Create test + fixed questions + student assignments
- `getAll(filters, userId, userRole)` — List tests (admin: all, teacher: own)
- `getById(id, userId, userRole)` — Get test details
- `update(id, data, userId, userRole)` — Update (draft/active only)
- `delete(id, userId, userRole)` — Soft delete
- `activate(id, userId)` — draft → active
- `deactivate(id, userId)` — active → inactive

---

## Phase 4: Backend Service — Student Eligibility & Start

### File: `predefinedTest.service.ts` (continued)

Methods:

- `getPendingTests(studentId)` — Get tests available to student
- `getByToken(token, studentId)` — Get test info from link
- `startTest(testId, studentId)` — Validate eligibility + create session

**Eligibility Logic:**

1. Test must be "active"
2. If scheduled: current time must be within start/end window
3. Student must be assigned OR enrollment matches course/subject
4. Student must have remaining attempts

**Start Logic:**

1. Verify eligibility
2. If `use_fixed_questions` → fetch from `predefined_test_questions`
3. Else → dynamically select based on filters
4. Create `TestSession` with `predefined_test_id` linked
5. Create `TestAnswer` stubs
6. Return session + questions

---

## Phase 5: Backend Controller & Routes

### File: `predefinedTest.controller.ts` (NEW)

Handlers:

- `create` — POST /api/test/predefined
- `getAll` — GET /api/test/predefined
- `getById` — GET /api/test/predefined/:id
- `update` — PUT /api/test/predefined/:id
- `delete` — DELETE /api/test/predefined/:id
- `activate` — POST /api/test/predefined/:id/activate
- `deactivate` — POST /api/test/predefined/:id/deactivate
- `getPending` — GET /api/test/predefined/pending
- `getByToken` — GET /api/test/predefined/join/:token
- `startTest` — POST /api/test/predefined/:id/start

### File: `predefinedTest.routes.ts` (NEW)

Route definitions with auth middleware.

### File: `testService/src/index.ts` (MODIFY)

Register new routes: `app.use("/api/test/predefined", predefinedTestRoutes)`

---

## Phase 6: Gateway Routes

### File: `apiGateway/src/config/routes.ts` (MODIFY)

Add routes for all predefined test endpoints with proper auth/roles.

---

## Phase 7: Frontend — Admin/Teacher Pages

### New Pages:

- `frontend/app/(dashboard)/dashboard/tests/create/page.tsx` — Create predefined test form
- `frontend/app/(dashboard)/dashboard/tests/[id]/page.tsx` — Test details page

### Modified Pages:

- `frontend/app/(dashboard)/dashboard/tests/page.tsx` — Add tabs (My Tests / Student Tests)

### Components:

- `frontend/components/predefined-test-form.tsx` — Reusable form component
- `frontend/components/question-selector.tsx` — Question picker for fixed questions

---

## Phase 8: Frontend — Student Pages

### New Pages:

- `frontend/app/(dashboard)/dashboard/tests/pending/page.tsx` — Pending tests list
- `frontend/app/(test)/join/[token]/page.tsx` — Test join page (requires login)

### Modified:

- `frontend/components/student-dashboard.tsx` — Add pending tests section

---

## Phase 9: Frontend — API Layer

### File: `frontend/lib/api-routes.ts` (MODIFY)

Add `PREDEFINED_TESTS` routes.

### File: `frontend/lib/api.ts` (MODIFY)

Add `predefinedTestsApi` with all methods:

- `create`, `getAll`, `getById`, `update`, `delete`
- `activate`, `deactivate`
- `getPending`, `getByToken`, `start`

### File: `frontend/hooks/` (NEW)

- `use-predefined-tests.ts` — Hook for admin/teacher test list
- `use-pending-tests.ts` — Hook for student pending tests

---

## Phase 10: Testing & Documentation

### Backend Testing:

1. Create test as admin → verify
2. Create test as teacher → verify only their courses
3. Schedule test → verify time window enforcement
4. Fixed questions → verify same questions for all
5. Dynamic questions → verify different per student
6. Student assignment → verify only assigned can start
7. Auto-eligibility → verify enrolled students see it
8. Test link → verify shareable link works
9. Single attempt → verify can't retake
10. Status transitions → draft → active → inactive

### Frontend Testing:

1. Create test flow end-to-end
2. Edit/deactivate test
3. Student sees pending tests
4. Student joins via link
5. Student starts and completes test
6. Results appear in teacher dashboard

### Documentation:

- Update `testService/API.md`
- Update `TEACHER-ASSIGNMENT-PLAN.md`

---

## Files Summary

### New Files (Backend):

| File                                                                       | Purpose                  |
| -------------------------------------------------------------------------- | ------------------------ |
| `testService/src/modules/predefinedTest/predefinedTest.model.ts`         | PredefinedTest model     |
| `testService/src/modules/predefinedTest/predefinedTestQuestion.model.ts` | Fixed questions model    |
| `testService/src/modules/predefinedTest/predefinedTestStudent.model.ts`  | Student assignment model |
| `testService/src/modules/predefinedTest/predefinedTest.service.ts`       | All business logic       |
| `testService/src/modules/predefinedTest/predefinedTest.controller.ts`    | Request handlers         |
| `testService/src/modules/predefinedTest/predefinedTest.validation.ts`    | Zod schemas              |
| `testService/src/modules/predefinedTest/predefinedTest.routes.ts`        | Route definitions        |

### Modified Files (Backend):

| File                                                         | Change                           |
| ------------------------------------------------------------ | -------------------------------- |
| `testService/src/modules/testSession/testSession.model.ts` | Add`predefined_test_id` column |
| `testService/src/config/associations.ts`                   | Add new associations             |
| `testService/src/index.ts`                                 | Register new routes              |
| `apiGateway/src/config/routes.ts`                          | Add gateway routes               |

### New Files (Frontend):

| File                                                          | Purpose               |
| ------------------------------------------------------------- | --------------------- |
| `frontend/app/(dashboard)/dashboard/tests/create/page.tsx`  | Create test page      |
| `frontend/app/(dashboard)/dashboard/tests/[id]/page.tsx`    | Test details page     |
| `frontend/app/(dashboard)/dashboard/tests/pending/page.tsx` | Student pending tests |
| `frontend/app/(test)/join/[token]/page.tsx`                 | Test join page        |
| `frontend/components/predefined-test-form.tsx`              | Test creation form    |
| `frontend/components/question-selector.tsx`                 | Question picker       |
| `frontend/hooks/use-predefined-tests.ts`                    | Admin/teacher hook    |
| `frontend/hooks/use-pending-tests.ts`                       | Student hook          |

### Modified Files (Frontend):

| File                                                  | Change            |
| ----------------------------------------------------- | ----------------- |
| `frontend/app/(dashboard)/dashboard/tests/page.tsx` | Add tabs          |
| `frontend/components/student-dashboard.tsx`         | Add pending tests |
| `frontend/lib/api-routes.ts`                        | Add routes        |
| `frontend/lib/api.ts`                               | Add API methods   |

---

## Verification Checklist

- [ ] Admin can create predefined test
- [ ] Teacher can create predefined test for their courses
- [ ] Scheduled tests enforce time window
- [ ] Fixed questions served to all students
- [ ] Dynamic questions vary per student
- [ ] Student assignment works
- [ ] Auto-eligibility works
- [ ] Shareable link works (requires login)
- [ ] Single attempt enforced
- [ ] Status transitions work (draft → active → inactive)
- [ ] Pending tests appear for eligible students
- [ ] Current student-initiated tests unaffected
- [ ] WebSocket test-taking works for predefined tests
- [ ] Results appear in teacher dashboard
