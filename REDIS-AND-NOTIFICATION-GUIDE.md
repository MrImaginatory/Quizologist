# Redis Implementation & Notification System Guide

> Generated from full backend analysis — 8 microservices, 103 endpoints, 14 database tables, 0 existing caching/notification infrastructure.

---

## Table of Contents

1. [Backend Architecture Summary](#1-backend-architecture-summary)
2. [Redis Implementation Guide](#2-redis-implementation-guide)
3. [Notification System Design](#3-notification-system-design)
4. [Implementation Roadmap](#4-implementation-roadmap)

---

## 1. Backend Architecture Summary

### Services

| Service | Port | Tables Owned | Key Responsibility |
|---------|------|-------------|-------------------|
| API Gateway | 3000 | None | Auth, RBAC, proxy, health monitoring |
| User Service | 3001 | `users`, `locations` | Registration, login, user CRUD |
| Content Service | 3002 | `courses`, `subjects`, `topics` | Content hierarchy CRUD |
| Question Service | 3003 | `questions` | Question CRUD, bulk import, Excel template |
| Student Service | 3004 | `enrollments` | Enrollment management |
| Test Service | 3005 | `test_sessions`, `test_answers`, `test_selections`, `predefined_tests`, `predefined_test_questions`, `predefined_test_students` | Test lifecycle, real-time Socket.IO |
| Teacher Service | 3006 | `teacher_assignments` | Teacher-course-subject assignments, analytics |
| Dashboard Service | 3007 | None (read-only) | KPI stats, analytics, trends |

### Current State
- **Zero caching** — every request hits PostgreSQL directly
- **Zero rate limiting** — no protection against abuse
- **Zero notification infrastructure** — no email, no push, no in-app notifications
- **Zero job queues** — all processing is synchronous
- **Shared PostgreSQL** — all 8 services connect to the same database

---

## 2. Redis Implementation Guide

### 2.1 Where Redis Should Be Implemented

#### Priority 1: HIGH IMPACT (Implement First)

| # | Service | Endpoint/Pattern | Current Problem | Redis Solution | Expected Improvement |
|---|---------|-----------------|-----------------|----------------|---------------------|
| 1 | **API Gateway** | All auth checks | JWT decoded on every request | **JWT session cache** — cache decoded token + user info for 5-10 min | 60-80% reduction in JWT decode overhead |
| 2 | **Dashboard Service** | `GET /api/dashboard/stats` | 7+ raw SQL queries per request, called on every dashboard visit | **Result cache** — cache KPI stats for 30-60s | Sub-second dashboard loads |
| 3 | **Dashboard Service** | `GET /api/dashboard/student/*` (6 endpoints) | Heavy aggregation queries (topic performance, trends, strengths) | **Result cache** — cache per student for 60s | Eliminate redundant heavy queries |
| 4 | **Dashboard Service** | `GET /api/dashboard/analytics/*` (4 endpoints) | Complex JOINs across multiple tables | **Result cache** — cache for 60-120s | Reduce DB load on analytics |
| 5 | **Content Service** | `GET /api/content/course/`, `subject/`, `topic/` | Frequently read, rarely written | **Full cache** — cache entire lists, invalidate on write | Near-instant content lookups |
| 6 | **Question Service** | `GET /api/question/filter`, `GET /api/question/topic/:id` | Filtered queries with teacher scoping | **Result cache** — cache per filter combination | Faster question browsing |

#### Priority 2: MEDIUM IMPACT

| # | Service | Endpoint/Pattern | Current Problem | Redis Solution |
|---|---------|-----------------|-----------------|----------------|
| 7 | **Test Service** | `GET /api/test/predefined/pending` | Complex query checking eligibility, attempts, schedule | Cache per student for 30s |
| 8 | **Test Service** | `GET /api/test/predefined/:id` | Single test lookup | Cache with invalidation on update |
| 9 | **Student Service** | `GET /api/enrollment/` | Enrollment lookups for every dashboard load | Cache per student for 60s |
| 10 | **Teacher Service** | `GET /api/teacher/teaching/*` (5 endpoints) | Complex queries with enrollment joins | Cache per teacher for 60s |
| 11 | **API Gateway** | All requests | No rate limiting | **Rate limiting** — sliding window per user/IP |

#### Priority 3: LOWER PRIORITY

| # | Service | Endpoint/Pattern | Redis Solution |
|---|---------|-----------------|----------------|
| 12 | **User Service** | `GET /api/user/` | Cache user list for 30s |
| 13 | **Question Service** | `GET /api/question/search?q=` | Cache search results for 15s |
| 14 | **Test Service** | `GET /api/test/all` | Cache test list for 30s |
| 15 | **All Services** | Session management | **Rate limiting** per endpoint |

### 2.2 Redis Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Frontend   │────▶│  API Gateway  │────▶│  Services   │
│  (Next.js)   │     │  (port 3000)  │     │ (3001-3007) │
└─────────────┘     └──────┬───────┘     └──────┬──────┘
                           │                     │
                    ┌──────▼───────┐     ┌──────▼──────┐
                    │    Redis     │◀───▶│  PostgreSQL  │
                    │  (cache +    │     │  (shared DB) │
                    │  rate limit) │     └─────────────┘
                    └──────────────┘
```

### 2.3 Recommended Redis Setup

#### Shared Redis Client (new package)

Create `backend/shared/redis/` as a shared package:

```
backend/shared/redis/
├── package.json          # @quizologist/redis
├── src/
│   ├── index.ts          # Redis client singleton
│   ├── cache.ts          # Generic cache helper (get/set/invalidate)
│   ├── rateLimiter.ts    # Sliding window rate limiter
│   ├── pubsub.ts         # PubSub for cross-service notifications
│   └── types.ts          # TypeScript types
```

#### Cache Helper Pattern

```typescript
// Shared cache pattern for all services
import { RedisClient } from "@quizologist/redis";

// Generic cache wrapper
async function withCache<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const redis = RedisClient.getInstance();
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const data = await fetcher();
  await redis.setex(key, ttlSeconds, JSON.stringify(data));
  return data;
}

// Invalidation pattern
async function invalidatePattern(pattern: string) {
  const redis = RedisClient.getInstance();
  const keys = await redis.keys(pattern);
  if (keys.length > 0) await redis.del(...keys);
}
```

### 2.4 Specific Implementation Per Service

#### API Gateway — Auth Cache + Rate Limiting

**File**: `apiGateway/src/middlewares/auth.middleware.ts`

```
Cache key:    auth:token:{jwt_hash}
Cache value:  { userId, email, role, iat }
TTL:          5 minutes (or until token expires, whichever is shorter)
Invalidation: On logout (publish to Redis channel)
```

**File**: `apiGateway/src/middlewares/rateLimiter.ts` (NEW)

```
Strategy:     Sliding window counter
Limits:       - Auth endpoints: 10 req/min per IP
              - Read endpoints: 100 req/min per user
              - Write endpoints: 30 req/min per user
              - Bulk import: 5 req/min per user
Storage:      Redis sorted sets
```

#### Dashboard Service — KPI Cache

**File**: `dashboardService/src/modules/dashboard/dashboard.service.ts`

```
Cache keys:
  - dashboard:stats:{role}:{userId}          → TTL 30s
  - dashboard:student:topic-perf:{userId}    → TTL 60s
  - dashboard:student:subject-perf:{userId}  → TTL 60s
  - dashboard:student:trends:{userId}        → TTL 60s
  - dashboard:student:strengths:{userId}     → TTL 60s
  - dashboard:analytics:{filterHash}         → TTL 120s

Invalidation: After test submission (invalidate student stats)
              After enrollment change (invalidate enrollment-based stats)
```

#### Content Service — Full Cache

**File**: `contentService/src/modules/course/course.service.ts` (and subject, topic)

```
Cache keys:
  - content:courses                          → TTL 300s (5 min)
  - content:subjects:course:{courseId}       → TTL 300s
  - content:topics:subject:{subjectId}       → TTL 300s

Invalidation: On any CREATE/UPDATE/DELETE → invalidate the list + related keys
```

#### Test Service — Pending Tests + Predefined Test Cache

**File**: `testService/src/modules/predefinedTest/predefinedTest.service.ts`

```
Cache keys:
  - test:predefined:{testId}                 → TTL 30s
  - test:predefined:pending:{studentId}      → TTL 30s
  - test:predefined:token:{token}            → TTL 60s

Invalidation: On activate/deactivate/update → invalidate test + all pending caches
```

### 2.5 Redis Dependencies to Add

| Package | Service | Purpose |
|---------|---------|---------|
| `ioredis` | shared/redis | Redis client |
| `ioredis` | apiGateway | Rate limiting |
| No new deps | Others | Import shared @quizologist/redis |

---

## 3. Notification System Design

### 3.1 Notification Events

Based on the predefined test lifecycle, here are the **8 notification trigger points**:

| # | Trigger | Event | Recipient | Message | Priority |
|---|---------|-------|-----------|---------|----------|
| 1 | Teacher activates test | `test.activated` | All assigned students | "New test available: {title}" | High |
| 2 | N minutes before scheduled start | `test.scheduled_reminder` | All assigned students | "Test '{title}' starts in {n} min" | High |
| 3 | Scheduled test window opens | `test.window_opened` | All assigned students | "Test '{title}' is now available!" | High |
| 4 | Student assigned to test | `test.assigned` | Newly assigned students | "You've been assigned: {title}" | Medium |
| 5 | Student starts test | `test.started` | Teacher (creator) | "{name} started '{title}'" | Medium |
| 6 | Student completes test | `test.completed` | Teacher (creator) | "{name} scored {score}% on '{title}'" | High |
| 7 | Student abandons test | `test.abandoned` | Teacher (creator) | "{name} abandoned '{title}'" | Medium |
| 8 | Scheduled test window ends | `test.window_closed` | Students + Teacher | "Test '{title}' has ended" | Low |

### 3.2 Notification Storage

**New table: `notifications`** (add to User Service or create a new Notification Service)

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(50) NOT NULL,  -- test.activated, test.completed, etc.
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,                 -- { test_id, student_id, score, etc. }
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP        -- soft delete
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
```

### 3.3 Notification Delivery Channels

```
                    ┌──────────────┐
                    │  Notification │
                    │    Service    │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ In-App   │ │ Real-Time│ │  Email   │
        │ (DB)     │ │ (Socket) │ │(Optional)│
        └──────────┘ └──────────┘ └──────────┘
```

#### Channel 1: In-App Notifications (Database)
- Stored in `notifications` table
- Fetched via `GET /api/notifications?is_read=false`
- Displayed in a notification bell/dropdown in the header

#### Channel 2: Real-Time Push (Socket.IO)
- Extend existing Socket.IO in Test Service
- Add a `notifications` room per user
- When a notification is created, publish to Redis PubSub → all instances push to connected clients
- Frontend listens for `notification:new` event

#### Channel 3: Email (Optional, Phase 2)
- Use `nodemailer` or a transactional email service
- Send for high-priority events only (test activated, test completed)
- Queue via Redis-backed job queue (BullMQ)

### 3.4 Notification Service Architecture

**New service: `notificationService`** (port 3008)

```
notificationService/
├── src/
│   ├── index.ts                    # Express app
│   ├── config/
│   │   ├── database.ts             # Sequelize connection
│   │   ├── env.ts                  # Environment config
│   │   └── redis.ts                # Redis connection
│   ├── modules/
│   │   ├── notification/
│   │   │   ├── notification.model.ts
│   │   │   ├── notification.service.ts
│   │   │   ├── notification.controller.ts
│   │   │   └── notification.routes.ts
│   │   └── scheduler/
│   │       ├── scheduler.service.ts    # Cron jobs for scheduled notifications
│   │       └── scheduler.routes.ts
│   ├── jobs/
│   │   ├── test-reminder.job.ts        # Check upcoming tests
│   │   ├── test-window.job.ts          # Check opened/closed windows
│   │   └── queue.worker.ts             # BullMQ workers for email
│   └── socket/
│       └── notificationSocket.ts       # Real-time notification push
```

### 3.5 Scheduler Design (for time-based notifications)

**Using `node-cron` or `bullmq` repeatable jobs:**

```
Every 1 minute:
  ├── Find active scheduled tests where start_time is within 5 minutes
  │   → Create "reminder" notifications for assigned students
  │   → Publish to Redis PubSub for real-time push
  │
  ├── Find active scheduled tests where start_time just passed (within last minute)
  │   → Create "window opened" notifications
  │   → Publish to Redis PubSub
  │
  └── Find active scheduled tests where end_time just passed (within last minute)
      → Create "window closed" notifications
      → Publish to Redis PubSub
```

### 3.6 Integration Points in Existing Code

| Existing File | What to Add |
|---------------|-------------|
| `testService/predefinedTest.service.ts` → `activate()` | Call `notificationService.notifyMultiple(studentIds, 'test.activated', ...)` |
| `testService/predefinedTest.service.ts` → `startTest()` | Call `notificationService.notifyUser(teacherId, 'test.started', ...)` |
| `testService/testSession.service.ts` → `submit()` | Call `notificationService.notifyUser(teacherId, 'test.completed', ...)` |
| `testService/socket/sessionManager.ts` → `handleDisconnect()` | Call `notificationService.notifyUser(teacherId, 'test.abandoned', ...)` |
| `testService/predefinedTest.service.ts` → `create()` + `update()` | Call `notificationService.notifyMultiple(newStudentIds, 'test.assigned', ...)` |
| `apiGateway/config/routes.ts` | Add routes for `/notification/*` |

### 3.7 Frontend Changes Needed

| File | Change |
|------|--------|
| `app/(dashboard)/layout.tsx` | Add notification bell icon with unread count badge |
| `components/notifications/notification-bell.tsx` (NEW) | Dropdown showing recent notifications |
| `components/notifications/notification-list.tsx` (NEW) | Full notification list page |
| `hooks/use-notifications.ts` (NEW) | SWR hook for fetching notifications |
| `hooks/use-notification-socket.ts` (NEW) | Socket.IO listener for real-time notifications |

---

## 4. Implementation Roadmap

### Phase 1: Redis Foundation (Week 1)

1. **Set up Redis** — Docker compose or local install
2. **Create `shared/redis` package** — client singleton, cache helper, rate limiter
3. **API Gateway: Rate limiting** — sliding window per user/IP
4. **API Gateway: Auth cache** — cache decoded JWT for 5 min
5. **Content Service: Full cache** — cache courses/subjects/topics lists

### Phase 2: Dashboard Caching (Week 2)

6. **Dashboard Service: KPI cache** — cache stats queries for 30-60s
7. **Dashboard Service: Analytics cache** — cache heavy aggregation queries
8. **Test Service: Pending tests cache** — cache per-student pending list
9. **Student Service: Enrollment cache** — cache enrollment lookups

### Phase 3: Notification System (Week 3-4)

10. **Create `notificationService`** — model, CRUD, API routes
11. **Add `notifications` table** — via Sequelize migration
12. **Add API Gateway routes** — `/api/notification/*`
13. **Integrate with predefined test lifecycle** — hook into activate, start, submit, abandon
14. **Add Socket.IO notification push** — extend existing socket infrastructure
15. **Frontend: Notification bell + dropdown** — real-time notification UI

### Phase 4: Scheduled Notifications (Week 5)

16. **Add `node-cron` or `bullmq` to notificationService**
17. **Implement test reminder jobs** — check every minute for upcoming tests
18. **Implement window open/close jobs** — auto-notify on schedule changes
19. **Redis PubSub for cross-instance push** — ensure notifications reach all connected clients

### Phase 5: Email Notifications (Week 6, Optional)

20. **Add `nodemailer` to notificationService**
21. **Create email templates** — test activated, test completed
22. **Queue email jobs via BullMQ** — non-blocking email sending
23. **User preferences** — allow users to opt in/out of email notifications

---

## Appendix: Endpoint-to-Redis Mapping

| Service | Endpoint | Cache Key Pattern | TTL | Invalidation Trigger |
|---------|----------|-------------------|-----|---------------------|
| Gateway | Auth check | `auth:token:{hash}` | 5m | Logout |
| Content | GET courses | `content:courses` | 5m | Course CRUD |
| Content | GET subjects by course | `content:subjects:{courseId}` | 5m | Subject CRUD |
| Content | GET topics by subject | `content:topics:{subjectId}` | 5m | Topic CRUD |
| Dashboard | GET stats | `dash:stats:{role}:{userId}` | 30s | Test submit |
| Dashboard | GET topic perf | `dash:topic:{userId}` | 60s | Test submit |
| Dashboard | GET subject perf | `dash:subject:{userId}` | 60s | Test submit |
| Dashboard | GET trends | `dash:trends:{userId}` | 60s | Test submit |
| Dashboard | GET strengths | `dash:strengths:{userId}` | 60s | Test submit |
| Dashboard | GET analytics | `dash:analytics:{hash}` | 120s | Data change |
| Test | GET pending | `test:pending:{studentId}` | 30s | Activate/deactivate |
| Test | GET predefined by ID | `test:predefined:{id}` | 30s | Update |
| Test | GET by token | `test:token:{token}` | 60s | Update |
| Student | GET enrollments | `enroll:list:{studentId}` | 60s | Enrollment CRUD |
| Teacher | GET teaching tests | `teacher:tests:{teacherId}` | 60s | Test change |
| Teacher | GET top students | `teacher:top:{teacherId}` | 120s | Test submit |
| Teacher | GET weakness | `teacher:weak:{teacherId}` | 120s | Test submit |
| Teacher | GET coverage | `teacher:coverage:{teacherId}` | 120s | Question CRUD |
| User | GET all users | `user:list:{page}:{limit}` | 30s | User CRUD |
| Question | GET filter | `q:filter:{hash}` | 15s | Question CRUD |
| Question | GET by topic | `q:topic:{topicId}` | 15s | Question CRUD |
