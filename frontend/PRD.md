# Product Requirements Document (PRD)
## Quiz Application - Shadcn UI Frontend

### 1. Overview
A modern, responsive quiz management platform built with Next.js, shadcn/ui, and Tailwind CSS. The application serves three user roles: Admin, Teacher, and Student with role-based dashboards and features.

### 2. User Roles & Features

#### 2.1 Admin Dashboard
- **User Management**: View, create, edit, delete users; assign roles
- **Course/Subject/Topic Management**: Full CRUD for content hierarchy
- **Question Bank**: Manage MCQ and descriptive questions
- **System Overview**: KPIs showing total users, tests, questions, active sessions
- **Reports**: Export user/test data, view analytics

#### 2.2 Teacher Dashboard
- **Course Assignment**: View assigned courses and subjects
- **Test Creation**: Create tests with duration (15-45 min), question count ranges
- **Question Selection**: Pick questions from assigned subjects/topics
- **Live Test Monitoring**: Real-time view of student progress via Socket.IO
- **Grading**: Review and grade descriptive answers
- **Analytics**: Student performance per test, subject-wise breakdown

#### 2.3 Student Dashboard
- **Available Tests**: List of upcoming and active tests
- **Test Interface**: Timer, question navigation, auto-submit
- **Results**: Score, time taken, answer review
- **Progress Tracking**: Historical performance, subject-wise scores
- **Profile**: View/update personal information

### 3. Backend API Integration

The frontend communicates with 8 microservices via an API Gateway (port 3000):

| Service | Port | Key Endpoints |
|---------|------|---------------|
| User Service | 3001 | `/api/users/*`, `/api/auth/*` |
| Content Service | 3002 | `/api/courses/*`, `/api/subjects/*`, `/api/topics/*` |
| Question Service | 3003 | `/api/questions/*` |
| Student Service | 3004 | `/api/students/*`, `/api/enrollments/*` |
| Test Service | 3005 | `/api/tests/*`, Socket.IO for real-time |
| Teacher Service | 3006 | `/api/teachers/*`, `/api/assignments/*` |
| Dashboard Service | 3007 | `/api/dashboard/*`, `/api/analytics/*` |

### 4. Real-Time Features (Socket.IO)
- **Test Session**: `join_test`, `answer`, `skip`, `submit_test`, `heartbeat`
- **Server Events**: `test_joined`, `answer_recorded`, `time_update`, `test_submitted`, `error`
- **Auto-submit**: Server enforces time limits with automatic submission
- **Disconnect Handling**: Heartbeat every 30s, 60s timeout

### 5. Test Constraints
| Duration | Question Range |
|----------|----------------|
| 15 min | 15-30 questions |
| 20 min | 20-40 questions |
| 25 min | 25-50 questions |
| 30 min | 30-60 questions |
| 40 min | 35-80 questions |
| 45 min | 40-120 questions |

### 6. Authentication & Authorization
- JWT-based authentication via API Gateway
- Role-based access control (Admin, Teacher, Student)
- Token stored in httpOnly cookies
- Automatic token refresh handling

### 7. Responsive Design Requirements
- **Mobile**: Stack layout, bottom navigation, horizontal scroll for tables
- **Tablet**: Collapsible sidebar, 2-column layouts
- **Desktop**: Full sidebar, multi-column grids

### 8. Design System
- Built on shadcn/ui component library
- Indigo primary color scheme (consistent with existing frontend)
- Light/Dark mode support
- Inter font family
- Consistent spacing using 4px base unit

### 9. Technical Requirements
- **Framework**: Next.js 16 (App Router)
- **UI Library**: shadcn/ui
- **Styling**: Tailwind CSS v4
- **State Management**: React hooks + context
- **Real-time**: Socket.IO client
- **Type Safety**: Full TypeScript coverage
- **Testing**: Vitest + React Testing Library

### 10. Success Metrics
- Page load < 2 seconds
- Lighthouse score > 90
- Zero critical accessibility violations
- Full mobile responsiveness
- TypeScript strict mode enabled
