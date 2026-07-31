# Quizologist — Frontend

> Modern quiz management platform built with Next.js 16, React 19, and Tailwind CSS.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16.2.10 (App Router) |
| UI Library | React 19.2.4 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Icons | Lucide React |
| State / Data | SWR, Context API |
| Real-time | Socket.IO Client |
| Charts | Recharts |
| PDF / Excel | jsPDF, xlsx |
| Animation | Framer Motion |
| Date | date-fns |
| Package manager | pnpm |

## Prerequisites

- Node.js >= 18
- pnpm >= 8
- Backend services running (default: `http://localhost:5001`)

## Installation

```bash
cd frontend
pnpm install
```

## Environment

Create `.env` from the existing template or copy `.env.example` if available.

Required variables:

```dotenv
NEXT_PUBLIC_APP_NAME=Quizologist
NEXT_PUBLIC_APP_LOGO=/Quizologist.svg
NEXT_PUBLIC_BACKEND_URL=http://localhost:5001
NEXT_PUBLIC_API_URL=http://localhost:5001
```

> `NEXT_PUBLIC_` prefix is required for client-side exposure in Next.js.

## Running the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

To change the port:

```bash
pnpm dev -- --port 3001
```

## Build & Production

```bash
pnpm build
pnpm start
```

## Project Structure

```
frontend/
├── app/
│   ├── (auth)/               # Authentication routes (signin)
│   ├── (dashboard)/          # Protected dashboard routes
│   │   └── dashboard/
│   │       ├── analytics/    # Performance analytics
│   │       ├── courses/      # Faculty/subject/topic management
│   │       ├── enrollments/  # Student enrollments
│   │       ├── locations/    # Location management
│   │       ├── questions/    # Question bank + import
│   │       ├── students/     # Student directory
│   │       ├── teachers/     # Teacher management
│   │       ├── tests/        # Test creation, management, results
│   │       └── topics/       # Topic management
│   ├── (test)/               # Test-taking routes
│   │   ├── live-test/        # Live test session
│   │   ├── tb-live-test/     # Tablet-optimized live test
│   │   ├── test-result/      # Test results view
│   │   └── join/[token]/     # Token-based test join
│   ├── globals.css
│   ├── layout.tsx            # Root layout + providers
│   └── page.tsx              # Landing page
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── theme-provider.tsx
│   ├── theme-toggle.tsx
│   ├── toaster.tsx
│   └── vitals-provider.tsx
├── contexts/
│   └── auth-context.tsx      # JWT auth state management
├── hooks/                    # Custom React hooks
├── lib/
│   ├── app-config.ts         # App-wide configuration
│   └── utils.ts              # Helper utilities
├── public/                   # Static assets
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Key Features

- **Role-based authentication** — Admin, Teacher, Student flows
- **Real-time test taking** — Socket.IO-powered live sessions with auto-submit on timeout
- **Content hierarchy** — Faculty → Subject → Topic management
- **Question bank** — MCQ and descriptive questions with difficulty levels
- **Test management** — Create, assign, review, and grade tests
- **Analytics dashboard** — Performance trends, strengths/weaknesses, topic-wise breakdowns
- **Enrollment system** — Batch student enrollment with integrity checks
- **PDF/Excel export** — Generate reports and download data
- **Responsive design** — Mobile-first with dark mode support

## State Management

- **Auth:** `AuthProvider` context stores JWT and user profile
- **Server state:** SWR for API data fetching and caching
- **Local state:** React `useState` / `useReducer` for UI state

## Real-time Communication

The frontend connects directly to the Test Service via Socket.IO for test sessions:

```typescript
const socket = io(NEXT_PUBLIC_BACKEND_URL, {
  auth: { token: jwt }
});
```

Events: `join_test`, `answer`, `skip`, `submit_test`, `heartbeat`.

## Linting

```bash
pnpm lint
```

## Notes

- The backend API Gateway must be running before authenticating.
- Socket.IO connects directly to the Test Service (bypasses the gateway).
- All API calls are proxied through `/api/*` on the backend gateway.
