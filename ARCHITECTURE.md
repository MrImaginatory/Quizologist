# QuizNew Architecture

> Generated from GitNexus knowledge graph (2,737 nodes, 5,211 edges, 96 clusters, 139 execution flows) and all 8 service API.md files.

## Overview

QuizNew is an educational quiz platform built as a **microservices architecture** with 8 backend services, a Next.js 16 frontend, and a single shared PostgreSQL database. All HTTP traffic flows through an API Gateway that handles authentication and role-based access control. Real-time test-taking uses Socket.IO with a direct connection to the Test Service.

**Tech Stack:**
- **Backend:** Node.js, Express 5, Sequelize v6, PostgreSQL
- **Frontend:** Next.js 16, React 19, CSS Modules, TypeScript
- **Real-time:** Socket.IO (direct to Test Service)
- **Auth:** JWT (7-day expiry)
- **Package manager:** pnpm
- **Validation:** Zod

## Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        FE["Next.js 16 Frontend<br/>React 19 + CSS Modules"]
        SocketIO["Socket.IO Client"]
    end

    subgraph "Gateway Layer - Port 3000"
        GW["API Gateway<br/>JWT Auth + RBAC + Proxy"]
    end

    subgraph "Service Layer"
        US["User Service<br/>:3001"]
        CS["Content Service<br/>:3002"]
        QS["Question Service<br/>:3003"]
        SS["Student Service<br/>:3004"]
        TS["Test Service<br/>:3005"]
        TchS["Teacher Service<br/>:3006"]
        DS["Dashboard Service<br/>:3007"]
    end

    subgraph "Data Layer"
        DB[("PostgreSQL<br/>quizologist_database")]
    end

    FE -->|"HTTP (all REST)"| GW
    SocketIO -->|"WebSocket (direct)"| TS

    GW -->|"/api/user/*"| US
    GW -->|"/api/content/*"| CS
    GW -->|"/api/question/*"| QS
    GW -->|"/api/enrollment/*"| SS
    GW -->|"/api/student/*"| SS
    GW -->|"/api/test/*"| TS
    GW -->|"/api/teacher/*"| TchS
    GW -->|"/api/dashboard/*"| DS

    US --> DB
    CS --> DB
    QS --> DB
    SS --> DB
    TS --> DB
    TchS --> DB
    DS --> DB
```

## Functional Areas

### 1. API Gateway (`backend/apiGateway/` — Port 3000)

Single entry point for all HTTP requests. Handles:

- **JWT Authentication:** Validates Bearer tokens, extracts `userId`, `email`, `role` into headers
- **RBAC:** Method-based access control. Separate route entries per HTTP method (POST/PUT/DELETE vs GET) enforce write vs read permissions per role
- **Proxy:** Forwards requests to downstream services via `fetch()`, passes user info as `x-user-id`, `x-user-email`, `x-user-role` headers

**Role Permissions:**

| Role | Access |
|------|--------|
| Admin | Full access to all endpoints |
| Teacher | Read content, CRUD questions, view students |
| Student | Read content, read questions, enrollments, take tests |

**Key files:**
- `src/config/routes.ts` — Route-to-service mapping with RBAC rules
- `src/middlewares/auth.middleware.ts` — JWT validation
- `src/middlewares/rbac.middleware.ts` — Role-based access control
- `src/middlewares/proxy.middleware.ts` — Service proxying

### 2. User Service (`backend/userService/` — Port 3001)

Manages user registration, authentication, and user CRUD.

**Endpoints:** `POST /signup`, `POST /login`, `GET /`, `GET /role/:role`, `GET /:id`

**Key patterns:**
- All string fields stored in lowercase (except password)
- Soft-delete restore: on signup with deleted email, restore account
- JWT with 7-day expiry

### 3. Content Service (`backend/contentService/` — Port 3002)

Manages the academic content hierarchy: Faculty → Subject → Topic.

**Endpoints:**
- `/api/content/faculty` — CRUD (admin only for write)
- `/api/content/subject` — CRUD (all roles for read)
- `/api/content/topic` — CRUD (all roles for read)

**Key patterns:**
- Deletion protection: count dependent children before soft-delete
- Nested includes: queries return associated record names (not just IDs)

### 4. Question Service (`backend/questionService/` — Port 3003)

Manages question bank with MCQ and descriptive question types.

**Endpoints:** `POST /`, `GET /`, `GET /search?q=`, `GET /filter`, `GET /topic/:topicId`, `GET /:id`, `PUT /:id`, `DELETE /:id`

**Key patterns:**
- Foreign key validation: `topic_id`, `subject_id`, `faculty_id` must reference active records
- Unique constraint: same question text cannot repeat within same topic
- Difficulty levels: `beginner`, `normal`, `mid`, `hard`, `expert`
- `questionAddedBy` auto-populated from gateway user header

### 5. Student Service (`backend/studentService/` — Port 3004)

Manages student enrollments and student listing.

**Endpoints:**
- `POST /` — Batch enrollment (1-50 items per request)
- `GET /` — Own enrollments (student)
- `GET /student/:studentId` — Student enrollments (admin/teacher)
- `GET /list` — All students with enrollment-based filtering (admin)
- `GET /:studentId/enrollments` — Student detail enrollments (admin)
- `DELETE /:id` — Unenroll

**Key patterns:**
- Batch enrollment with `created[]` and `skipped[]` arrays
- Composite unique index on (student_id, faculty_id, subject_id, topic_id)
- Topic enrollment: enrolling at subject level grants access to ALL topics under it

### 6. Teacher Service (`backend/teacherService/` — Port 3006)

Manages teacher-faculty-subject assignments.

**Endpoints:**
- `GET /list` — Teachers with assignment counts (admin)
- `POST /assign/faculty` — Assign faculty to teacher (admin)
- `POST /assign/subject` — Assign subject to teacher (admin)
- `DELETE /:id` — Remove assignment (admin)
- `GET /` — All assignments with filters (admin)
- `GET /teacher/:teacherId` — Assignments for specific teacher (admin/teacher)

**Key patterns:**
- `teacher_assignments` table: teacher_id (required), faculty_id (required), subject_id (nullable = faculty-only)
- Topics NOT assigned separately — all topics under a subject automatically available
- Raw SQL for aggregation queries (facultyCount, subjectCount, totalAssignments)

### 7. Test Service (`backend/testService/` — Port 3005)

Manages test sessions, real-time test-taking via Socket.IO, and grading.

**REST Endpoints:**
- `POST /start` — Start test with multi-selection
- `POST /submit/:testId` — Submit and grade
- `POST /abandon/:testId` — Abandon test
- `GET /result/:testId` — Full result with answers
- `GET /history` — Own test history (student)
- `GET /student/:studentId` — Student tests (admin/teacher)
- `GET /student/:studentId/performance` — Performance summary
- `GET /detail/:testId` — Full test detail (admin/teacher)
- `GET /all` — All tests with filters (admin)

**Socket.IO Events:**
- Client → Server: `join_test`, `answer`, `skip`, `submit_test`, `heartbeat`
- Server → Client: `test_joined`, `answer_recorded`, `time_update`, `test_submitted`, `error`

**Key patterns:**
- Multi-selection: students select multiple faculties/subjects/topics
- Duration-to-question-limit mapping (15min→15-30, up to 45min→40-120)
- Server-side timer: `ends_at = started_at + duration_minutes`, auto-submit on expiry
- Answer stubs: pre-created with `selected_answer: null` for all questions
- Test ID format: `{firstName}_{lastName}_{dayAbbrev}_{YYYYMMDD}_{HHmmss}`
- Disconnect recovery: increment `disconnect_count`, save `last_question_index`, resume on rejoin
- Heartbeat: 30s interval, 60s timeout

### 8. Dashboard Service (`backend/dashboardService/` — Port 3007)

Provides role-based KPI statistics and student analytics.

**Endpoints:**
- `GET /stats` — Role-based KPI cards (admin: 7 cards, teacher: 4 cards, student: 2 cards)
- `GET /student/topic-performance` — Topic-wise scores (student only)
- `GET /student/subject-performance` — Subject-wise scores
- `GET /student/difficulty-breakdown` — Performance by difficulty
- `GET /student/time-analysis` — Average time per question
- `GET /student/performance-trends` — Test score trends over time
- `GET /student/strengths-weaknesses` — Topic rankings with thresholds (≥80% strong, 50-79% moderate, <50% weak)

**Key patterns:**
- Read-only Sequelize models for TestSession, TestAnswer, Question, Topic, Subject, Faculty
- `timestamps: false` and `paranoid: false` on read-only models
- Minimum 3 attempts required for strength/weakness rankings

## Data Model

```mermaid
erDiagram
    users {
        uuid id PK
        varchar fname
        varchar lname
        varchar email UK
        varchar mobilenumber
        varchar password
        varchar role
        timestamp createdAt
        timestamp updatedAt
        timestamp deletedAt
    }

    faculties {
        uuid id PK
        varchar name
        text description
        timestamp deletedAt
    }

    subjects {
        uuid id PK
        varchar name
        text description
        uuid faculty_id FK
        timestamp deletedAt
    }

    topics {
        uuid id PK
        varchar name
        text description
        uuid subject_id FK
        timestamp deletedAt
    }

    questions {
        uuid id PK
        varchar type
        text question
        jsonb choices
        text correctAnswer
        text explanation
        varchar videoUrl
        varchar difficulty
        uuid topic_id FK
        uuid subject_id FK
        uuid faculty_id FK
        uuid questionAddedBy FK
        timestamp deletedAt
    }

    enrollments {
        uuid id PK
        uuid student_id FK
        uuid faculty_id FK
        uuid subject_id FK
        uuid topic_id FK
        timestamp deletedAt
    }

    teacher_assignments {
        uuid id PK
        uuid teacher_id FK
        uuid faculty_id FK
        uuid subject_id FK
        timestamp deletedAt
    }

    test_sessions {
        uuid id PK
        varchar test_id
        uuid student_id FK
        varchar status
        integer duration_minutes
        integer question_limit
        timestamp ends_at
        timestamp startedAt
        timestamp completedAt
        integer disconnect_count
        integer last_question_index
        timestamp deletedAt
    }

    test_selections {
        uuid id PK
        uuid test_session_id FK
        uuid faculty_id FK
        uuid subject_id FK
        uuid topic_id FK
        timestamp deletedAt
    }

    test_answers {
        uuid id PK
        uuid test_session_id FK
        uuid question_id FK
        integer question_index
        varchar selected_answer
        integer time_taken
        timestamp deletedAt
    }

    users ||--o{ enrollments : "student"
    users ||--o{ teacher_assignments : "teacher"
    users ||--o{ questions : "added_by"
    users ||--o{ test_sessions : "student"

    faculties ||--o{ subjects : "has"
    subjects ||--o{ topics : "has"
    topics ||--o{ questions : "has"
    subjects ||--o{ questions : "has"
    faculties ||--o{ questions : "has"

    faculties ||--o{ enrollments : "enrolled"
    subjects ||--o{ enrollments : "enrolled"
    topics ||--o{ enrollments : "enrolled"

    faculties ||--o{ teacher_assignments : "assigned"
    subjects ||--o{ teacher_assignments : "assigned"

    test_sessions ||--o{ test_answers : "has"
    test_sessions ||--o{ test_selections : "has"
    questions ||--o{ test_answers : "answered"
```

## Key Execution Flows

### Flow 1: Student Starts a Test

```mermaid
sequenceDiagram
    participant S as Student
    participant FE as Frontend
    participant GW as Gateway
    participant TS as Test Service
    participant QS as Question Service
    participant DB as Database

    S->>FE: Click "Start New Test"
    FE->>GW: POST /api/test/start
    GW->>GW: Validate JWT + RBAC
    GW->>TS: POST /start (x-user-* headers)
    TS->>DB: Check enrollment exists
    TS->>DB: Fetch questions via UNION query
    TS->>DB: Create test_session + answer stubs
    TS->>DB: Create test_selections
    TS-->>GW: 201 Created (questions + timer)
    GW-->>FE: Response
    FE->>FE: Open LiveTestClient
    FE->>TS: Socket.IO connect (JWT in auth)
    FE->>TS: join_test { testId }
    TS->>TS: Validate + check auto-submit
    TS-->>FE: test_joined { currentIndex, timeRemaining }
```

### Flow 2: Real-time Answer Submission

```mermaid
sequenceDiagram
    participant S as Student
    participant FE as Frontend
    participant TS as Test Service
    participant DB as Database

    S->>FE: Select answer + click Next
    FE->>TS: Socket: answer { testId, questionIndex, answer, timeTaken }
    TS->>TS: Check ends_at (auto-submit if expired)
    TS->>DB: UPDATE test_answers SET selected_answer
    TS-->>FE: answer_recorded { success, timeRemaining }
    FE->>FE: Advance to next question
```

### Flow 3: Test Submission and Grading

```mermaid
sequenceDiagram
    participant S as Student
    participant FE as Frontend
    participant TS as Test Service
    participant DB as Database

    S->>FE: Click "Submit Test"
    FE->>TS: Socket: submit_test { testId }
    TS->>DB: Lock test_session row
    TS->>DB: Fetch all test_answers
    TS->>DB: Fetch correct answers from questions
    TS->>TS: Grade: compare selected vs correct
    TS->>TS: Calculate score, correct, incorrect, skipped
    TS->>DB: UPDATE test_session (status=completed, scores)
    TS-->>FE: test_submitted { result, score }
    FE->>FE: Show results page
```

### Flow 4: Batch Enrollment

```mermaid
sequenceDiagram
    participant S as Student
    participant FE as Frontend
    participant GW as Gateway
    participant SS as Student Service
    participant CS as Content Service
    participant DB as Database

    S->>FE: Select faculties/subjects/topics
    FE->>GW: POST /api/enrollment { enrollments: [...] }
    GW->>GW: Validate JWT + RBAC (student only)
    GW->>SS: POST / (x-user-id header)
    loop For each enrollment item
        SS->>CS: GET /faculty/:id (validate exists)
        SS->>CS: GET /subject/:id (validate belongs to faculty)
        SS->>CS: GET /topic/:id (validate belongs to subject)
        SS->>DB: Check duplicate
        alt Not duplicate
            SS->>DB: INSERT enrollment
        else Duplicate
            SS->>SS: Add to skipped[]
        end
    end
    SS-->>GW: 201 { created[], skipped[] }
    GW-->>FE: Response
```

### Flow 5: Dashboard KPI Stats

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant GW as Gateway
    participant DS as Dashboard Service
    participant DB as Database

    U->>FE: Load dashboard
    FE->>GW: GET /api/dashboard/stats
    GW->>GW: Validate JWT + extract role
    GW->>DS: GET /stats (x-user-role header)
    alt Admin
        DS->>DB: COUNT tests, questions, topics, students, subjects, teachers
    else Teacher
        DS->>DB: COUNT questions added, students in faculties, tests in faculties
    else Student
        DS->>DB: COUNT questions in enrolled faculties, tests submitted
    end
    DS-->>GW: Role-specific KPI data
    GW-->>FE: Response
    FE->>FE: Render KPI cards with animated counters
```

## API Route Summary

| Service | Base Path | Key Endpoints | Auth |
|---------|-----------|---------------|------|
| Gateway | `/` | `/health`, `/status`, `/api` | None |
| User | `/api/user` | `/signup`, `/login`, `/`, `/role/:role`, `/:id` | Public / Admin |
| Content | `/api/content` | `/faculty/*`, `/subject/*`, `/topic/*` | Admin write / All read |
| Question | `/api/question` | `/`, `/search`, `/filter`, `/topic/:topicId` | Method-based RBAC |
| Enrollment | `/api/enrollment` | `/`, `/student/:studentId`, `/:id` | Student / Admin |
| Student | `/api/student` | `/list`, `/:studentId/enrollments` | Admin |
| Teacher | `/api/teacher` | `/list`, `/assign/faculty`, `/assign/subject`, `/teacher/:teacherId` | Admin / Teacher |
| Test | `/api/test` | `/start`, `/submit/:testId`, `/abandon/:testId`, `/history`, `/all`, `/result/:testId` | Student / Admin |
| Dashboard | `/api/dashboard` | `/stats`, `/student/topic-performance`, `/student/subject-performance`, etc. | All authenticated |

## Service Communication Patterns

1. **Gateway → Services:** HTTP proxy with `fetch()`, passes `x-user-*` headers
2. **Frontend → Services (REST):** Always through Gateway
3. **Frontend → Test Service (WebSocket):** Direct Socket.IO connection (bypasses Gateway)
4. **Service → Service:** Content Service provides FK validation for Student, Teacher, and Test Services via HTTP
5. **All services → Database:** Direct Sequelize ORM connections to shared `quizologist_database`

## Shared Database Tables

| Table | Owner Service | Used By |
|-------|---------------|---------|
| `users` | User Service | All services (read via raw SQL) |
| `faculties` | Content Service | Content, Student, Teacher, Test, Dashboard |
| `subjects` | Content Service | Content, Student, Teacher, Test, Dashboard |
| `topics` | Content Service | Content, Student, Test, Dashboard |
| `questions` | Question Service | Test, Dashboard |
| `enrollments` | Student Service | Student, Test |
| `teacher_assignments` | Teacher Service | Teacher, Question (seed) |
| `test_sessions` | Test Service | Test, Dashboard |
| `test_selections` | Test Service | Test |
| `test_answers` | Test Service | Test, Dashboard |
