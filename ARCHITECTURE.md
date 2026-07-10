# Quizologist - Architecture Documentation

> Auto-generated architecture overview based on codebase analysis.

## Overview

Quizologist is a quiz/examination platform with a microservices backend and a Next.js frontend. Students enroll in academic content organized as **Faculty > Subject > Topic**, take randomized timed MCQ tests via real-time WebSocket sessions, and receive scored results with explanations.

Three user roles: **admin** (full control), **teacher** (content management), **student** (enrollment + test-taking).

### Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, CSS Modules, Framer Motion |
| API Gateway | Node.js, Express, custom proxy middleware |
| Backend Services | Node.js, Express, Sequelize ORM, Zod validation |
| Real-time | Socket.IO (WebSocket) |
| Database | PostgreSQL (single shared instance) |
| Auth | JWT (RS256), bcrypt password hashing |

### Port Assignments

| Service | Port |
|---------|------|
| API Gateway | 3000 |
| User Service | 3001 |
| Content Service | 3002 |
| Question Service | 3003 |
| Student Service | 3004 |
| Test Service | 3005 |

---

## Architecture Diagram

```mermaid
graph TB
    subgraph Client["Client Layer"]
        FE["Next.js Frontend<br/>:3006"]
        Splash["Splash Screen<br/>(SVG Animation)"]
    end

    subgraph Gateway["API Gateway :3000"]
        GW["Gateway Server"]
        JWT["JWT Verification"]
        RBAC["Role-Based Access Control"]
        Proxy["Proxy Middleware<br/>(fetch-based)"]
    end

    subgraph Backend["Backend Microservices"]
        US["User Service<br/>:3001"]
        CS["Content Service<br/>:3002"]
        QS["Question Service<br/>:3003"]
        SS["Student Service<br/>:3004"]
        TS["Test Service<br/>:3005"]
    end

    subgraph Database["PostgreSQL"]
        DB["quizologist_database<br/>(shared instance)"]
    end

    subgraph Realtime["Real-time Layer"]
        WS["Socket.IO Server<br/>(port 3005)"]
    end

    subgraph FrontendUI["Frontend UI Components"]
        Sidebar["Sidebar Navigation<br/>(Collapsible)"]
        MobileNav["Mobile Bottom Nav<br/>(Responsive)"]
        Dashboard["Dashboard<br/>(KPI Cards)"]
        Auth["Auth Pages<br/>(Sign In/Up)"]
    end

    subgraph Users["User Roles"]
        Admin["Admin"]
        Teacher["Teacher"]
        Student["Student"]
    end

    FE --> Splash
    FE --> Sidebar
    FE --> MobileNav
    FE --> Dashboard
    FE --> Auth

    FE -->|HTTP API| GW
    GW --> JWT --> RBAC --> Proxy
    Proxy -->|fetch + headers| US
    Proxy -->|fetch + headers| CS
    Proxy -->|fetch + headers| QS
    Proxy -->|fetch + headers| SS
    Proxy -->|fetch + headers| TS

    US --> DB
    CS --> DB
    QS --> DB
    SS --> DB
    TS --> DB

    WS -.->|direct connect<br/>(bypasses gateway)| Student
    WS --> TS

    Admin --> FE
    Teacher --> FE
    Student --> FE
```

---

## Frontend Architecture

### Component Structure

```
frontend/src/
├── app/
│   ├── (auth)/                    # Auth route group
│   │   ├── layout.tsx            # AuthLayout wrapper
│   │   ├── signin/page.tsx       # Login form
│   │   └── signup/page.tsx       # Registration form
│   ├── (dashboard)/              # Dashboard route group
│   │   ├── layout.tsx            # DashboardLayout with sidebar
│   │   └── dashboard/page.tsx    # Main dashboard page
│   ├── globals.css               # CSS variables, reset, utilities
│   ├── layout.tsx                # Root layout with splash screen
│   └── page.tsx                  # Root redirect to /signin
├── components/
│   ├── auth/                     # Auth components
│   │   ├── AuthLayout.tsx        # Split-screen auth layout
│   │   ├── BrandPanel.tsx        # Left panel with branding
│   │   ├── Button.tsx            # Reusable button (4 variants)
│   │   ├── FormError.tsx         # Error message display
│   │   ├── Input.tsx             # Form input with validation
│   │   ├── LoadingSpinner.tsx    # Loading indicator
│   │   ├── RadioGroup.tsx        # Role selection radios
│   │   └── ThemeToggle.tsx       # Dark/light mode toggle
│   ├── dashboard/                # Dashboard components
│   │   ├── KpiCards.tsx          # 5 KPI cards with animated counters
│   │   └── MobileNav.tsx         # Mobile bottom navigation
│   ├── loading/
│   │   └── LoadingScreen.tsx     # Loading screen with spinner
│   ├── sidebar/
│   │   └── Sidebar.tsx           # Collapsible sidebar navigation
│   └── splash/
│       └── SplashScreen.tsx      # Splash screen with SVG animation
├── lib/
│   ├── api.ts                    # API client (singleton)
│   └── auth.ts                   # Token/user management
└── types/
    └── index.ts                  # TypeScript interfaces
```

### Key Features Implemented

#### 1. Splash Screen
- Animated SVG logo with stroke-dashoffset draw animation
- Title fade-in and spinner
- 2.5 second display before transitioning to app
- Uses `NEXT_PUBLIC_SVG_PATH` env variable for SVG path data

#### 2. Collapsible Sidebar
- Expands to 260px, collapses to 72px
- Framer Motion animations for smooth transitions
- Row layout when expanded, column layout when collapsed
- Role-based navigation (admin: 8 items, teacher: 6, student: 4)
- Active state highlighting with primary color
- User section with avatar, name, role, and logout button
- Persisted collapse state in localStorage

#### 3. Responsive Design
- Desktop: Sidebar navigation (>768px)
- Mobile: Bottom navigation bar (≤768px)
- Mobile "More" menu with additional nav items and theme toggle
- KPI cards responsive grid: 5 cols → 3 → 2 → 1

#### 4. Dashboard KPI Cards
- 5 cards: Tests Submitted, Total Questions, Total Topics, Topics Covered, Active Students
- Animated counters starting from 0
- Uniform indigo color scheme
- Staggered entrance animations with Framer Motion
- Hover lift effect

#### 5. Theme System
- CSS variables for light/dark modes
- Manual toggle via ThemeToggle button
- Theme persisted in localStorage
- Global styles with design tokens

### Design System

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#6366F1` (Indigo 500) | Buttons, links, active states |
| Background | `#F9FAFB` (Gray 50) | Page background |
| Card BG | `#FFFFFF` | Card surfaces |
| Border | `#E5E7EB` (Gray 200) | Dividers, card borders |
| Text Primary | `#111827` (Gray 900) | Headings |
| Text Secondary | `#6B7280` (Gray 500) | Body text |

### Animation Guidelines

| Element | Duration | Easing |
|---------|----------|--------|
| Sidebar expand/collapse | 300ms | cubic-bezier(0.4, 0, 0.2, 1) |
| KPI card entrance | 500ms | Staggered 100ms delay |
| Nav label fade | 200ms | ease-in-out |
| Button hover | 150ms | ease-in-out |
| Splash SVG draw | 1.5s | cubic-bezier(0.47, 0, 0.745, 0.715) |

---

## Backend Architecture

### 1. API Gateway (`backend/apiGateway/`)

Pure routing layer with **no database**. Handles:

- **JWT Verification** - Validates tokens on authenticated routes
- **Role-Based Access Control** - Enforces `admin`, `teacher`, `student` role restrictions per route
- **Request Proxying** - Forwards requests to downstream services via `fetch()`, injecting identity headers (`x-user-id`, `x-user-email`, `x-user-role`)
- **Route Table** - Flat array of route objects with path, target URL, auth requirements, allowed roles, and HTTP methods

**Key files:**
- `src/config/routes.ts` - Route definitions and matching logic
- `src/middlewares/proxy.middleware.ts` - Request forwarding
- `src/middlewares/rbac.middleware.ts` - Role enforcement

---

### 2. User Service (`backend/userService/`)

Handles authentication and user management. **Only service that generates JWT tokens.**

- **Authentication** - Signup with soft-delete restoration, login with bcrypt password verification
- **User Management** - CRUD operations, role-based filtering, paginated listing
- **Seeding** - Auto-creates default admin account (`admin@quizologist.com`)

**Key files:**
- `src/modules/user/user.model.ts` - User model (soft deletes, lowercased fields)
- `src/utils/jwtToken.ts` - JWT generation
- `src/config/seed.ts` - Default admin seeding

---

### 3. Content Service (`backend/contentService/`)

Manages the academic hierarchy:

- **Faculty** (e.g., "Computer Science") -> contains Subjects
- **Subject** (e.g., "Data Structures") -> contains Topics
- **Topic** (e.g., "Binary Trees") -> referenced by Questions

Features cascading delete protection (can't delete Faculty with Subjects, etc.) and unique names within parent scope.

**Key files:**
- `src/config/associations.ts` - Faculty hasMany Subject, Subject hasMany Topic
- `src/modules/*/` - MVC pattern: model, controller, service, routes, Zod validation

---

### 4. Question Service (`backend/questionService/`)

Owns the `questions` table with full CRUD plus search.

- **Question Types** - MCQ (with JSONB choices) and descriptive
- **Difficulty Levels** - beginner, normal, mid, hard, expert
- **Search** - PostgreSQL ILIKE for case-insensitive partial matching
- **Associations** - Includes Faculty/Subject/Topic via read-only model stubs for denormalized responses

**Key files:**
- `src/modules/question/question.model.ts` - Question model with JSONB choices
- `src/modules/question/question.controller.ts` - Search and CRUD logic

---

### 5. Student Service (`backend/studentService/`)

Manages enrollments linking students to content.

- **Batch Enrollment** - POST accepts array of enrollment items, validates hierarchy consistency, skips duplicates
- **Scope Levels** - Faculty-level, subject-level, or topic-level enrollment
- **Composite Unique Index** - Prevents duplicate student+faculty+subject+topic combinations

**Key files:**
- `src/modules/enrollment/enrollment.model.ts` - Enrollment model
- `src/modules/enrollment/enrollment.controller.ts` - Batch enrollment logic

---

### 6. Test Service (`backend/testService/`)

The most complex service - combines REST endpoints with Socket.IO for real-time quiz sessions.

**REST Endpoints:**
- Start test (guards: no active test, 5-min cooldown, 24h stale auto-abandon)
- Submit test (grades answers, computes score)
- Test history and performance aggregates
- Admin/teacher: view any student's performance

**Socket.IO Events:**
- `join_test` - Resume from saved position on reconnect
- `answer` / `skip` - Record responses with time tracking
- `heartbeat` - 30-second keep-alive (sessions abandoned after 60s silence)
- `submit_test` - Grade and finalize

**Key files:**
- `src/socket/sessionManager.ts` - Active connection tracking, heartbeat monitoring
- `src/socket/socketHandlers.ts` - WebSocket event handlers
- `src/modules/test/` - REST endpoint logic

---

### 7. API Collections (`api_collections/`)

OpenAPI 3.1.0 specifications for the API surface:

| Spec | Coverage |
|------|----------|
| `UserService.openapi.json` | Signup, login, user CRUD |
| `ContentService.openapi.json` | Faculty, Subject, Topic CRUD |
| `QuestionService.openapi.json` | Question CRUD, search, topic filtering |

**Note:** Student (enrollment) and Test service endpoints are not yet documented in OpenAPI specs.

---

## Key Execution Flows

### 1. App Initialization

```
1. Root Layout mounts
2. SplashScreen renders with SVG animation (2.5s)
3. SVG draws with stroke-dashoffset animation
4. Title fades in, spinner appears
5. SplashScreen completes, sets splashComplete=true
6. Actual app content renders
7. DashboardLayout checks authentication
8. If not authenticated -> redirect to /signin
9. If authenticated -> render Sidebar + main content
```

### 2. User Signup & Login

```
Client -> Gateway (POST /api/auth/signup)
  -> Verify no auth required
  -> Proxy to User Service :3001
  -> Check for soft-deleted user with same email
  -> Hash password, create/restore user
  -> Generate JWT
  -> Return token + user object

Client -> Gateway (POST /api/auth/login)
  -> Proxy to User Service :3001
  -> Verify password with bcrypt
  -> Generate JWT
  -> Return token + user object
  -> Store token + user in localStorage
  -> Redirect to /dashboard
```

### 3. Dashboard Rendering

```
1. DashboardLayout mounts
2. Check isAuthenticated() from localStorage
3. If not authenticated -> redirect to /signin
4. Load sidebar collapsed state from localStorage
5. Render Sidebar with role-based nav items
6. Render main content area with margin-left animation
7. KpiCards animate in with staggered counters
8. MobileNav renders on screens ≤768px
```

### 4. Content Management (Admin/Teacher)

```
Admin -> Gateway (POST /api/faculty) -> Content Service
Admin -> Gateway (POST /api/subject) -> Content Service
Admin -> Gateway (POST /api/topic) -> Content Service

All operations validate:
  - Faculty exists before creating Subject
  - Subject exists before creating Topic
  - No cascading deletes (Faculty -> Subject -> Topic)
```

### 5. Question Creation

```
Teacher -> Gateway (POST /api/question)
  -> Verify role = admin|teacher
  -> Proxy to Question Service :3003
  -> Validate topic_id exists (via read-only Topic model)
  -> Store MCQ choices as JSONB array
  -> Record questionAddedBy (teacher's user ID)
```

### 6. Student Enrollment

```
Student -> Gateway (POST /api/enrollment)
  -> Verify role = student
  -> Extract student_id from x-user-id header
  -> Proxy to Student Service :3004
  -> Batch validate enrollment items:
     - Faculty/Subject/Topic hierarchy consistency
     - Skip duplicates (composite unique index)
  -> Return created + skipped counts
```

### 7. Quiz Session (Real-time)

```
Student -> Gateway (POST /api/test/start)
  -> Verify enrollment matches requested scope
  -> Auto-abandon stale tests (>24h)
  -> Check 5-min cooldown
  -> Fetch questions (random order, stripped of answers)
  -> Create test session + pre-populate answer stubs
  -> Return session ID + questions

Student -> Socket.IO :3005 (direct, bypasses gateway)
  -> Authenticate via JWT on handshake
  -> join_test: resume from saved position
  -> answer/skip: record response with timestamp
  -> heartbeat: 30s keep-alive
  -> submit_test: grade all answers, compute score

Student -> Gateway (GET /api/test/:id/result)
  -> Return full breakdown with explanations + video URLs
```

### 8. Admin Performance Review

```
Admin -> Gateway (GET /api/test/student/:id/performance)
  -> Verify role = admin|teacher
  -> Return aggregates: avg/highest/lowest score, total correct/incorrect

Admin -> Gateway (GET /api/test/student/:id/history)
  -> Return paginated test history with scores
```

---

## Cross-Cutting Concerns

### Database Strategy

All six services share a single PostgreSQL database (`quizologist_database`). Each service owns its tables but reads from others via Sequelize model stubs (read-only). This avoids HTTP calls between services but couples them at the database level.

### Authentication Flow

1. JWT is generated by the User Service
2. JWT is verified by the API Gateway on every authenticated request
3. Gateway injects user identity as HTTP headers (`x-user-id`, `x-user-email`, `x-user-role`)
4. Downstream services trust these headers without re-verifying
5. Socket.IO authenticates independently via JWT on WebSocket handshake

### Soft Deletes

Every Sequelize model uses `paranoid: true`, marking records with `deleted_at` rather than physical deletion. The User Service has special restore logic for soft-deleted users during signup.

### Data Validation

All services use Zod schemas for request validation. Validation runs at the service level (after gateway proxy), not at the gateway itself.

### Responsive Design

- **Desktop (>768px):** Collapsible sidebar navigation
- **Mobile (≤768px):** Bottom navigation bar with "More" menu
- **Breakpoint:** 768px consistent between JS and CSS

### State Management

- **Auth state:** localStorage (`quizologist_token`, `quizologist_user`)
- **Theme state:** localStorage (`quizologist-theme`)
- **Sidebar state:** localStorage (`quizologist-sidebar-collapsed`)

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_BACKEND_URL` | API Gateway URL | `http://localhost:3000` |
| `NEXT_PUBLIC_TITLE` | App title | `Quizologist` |
| `NEXT_PUBLIC_LOGO` | Logo SVG path | `/Quizologist.svg` |
| `NEXT_PUBLIC_SVG_PATH` | SVG path data for animation | (long path string) |

---

## Observations & Considerations

| Aspect | Status |
|--------|--------|
| Backend services | Fully implemented |
| Frontend auth | Fully implemented |
| Frontend dashboard | Implemented (KPI cards, sidebar, mobile nav) |
| Splash screen | Implemented with SVG animation |
| OpenAPI specs | Partial (3/5 services) |
| Docker/CI/CD | Not configured |
| WebSocket auth | Bypasses gateway (direct to :3005) |
| Service isolation | Shared DB, not fully isolated |
| API versioning | None (all routes under `/api/`) |
| Rate limiting | Not implemented |
| Logging/monitoring | Not implemented |
