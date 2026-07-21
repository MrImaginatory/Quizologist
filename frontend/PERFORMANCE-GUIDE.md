# QuizNew Frontend — Performance Improvement Guide

> Generated from live Lighthouse audits (Desktop & Mobile) + full codebase analysis
> Date: 2026-07-21

---

## Current Lighthouse Scores

| Category | Desktop | Mobile |
|----------|---------|--------|
| Accessibility | 82 | 83 |
| Best Practices | 100 | 100 |
| SEO | 100 | 100 |

**Key Performance Metrics (Desktop, /signin page):**
- **LCP:** 1,948 ms (text-based, not a resource)
- **LCP breakdown:** TTFB 70ms (3.6%) + Element render delay 1,877ms (96.4%)
- **CLS:** 0.00
- **Critical path latency:** 99 ms
- **Render-blocking resources:** 1 CSS file (minimal impact, ~14ms total)
- **Font requests:** 3 woff2 files loaded
- **JS chunks loaded:** 27 script files on sign-in page alone

---

## Architecture Summary

- **Framework:** Next.js 16.2.10 (App Router) + React 19.2.4
- **Rendering:** 100% client-side rendered — every page uses `"use client"`
- **No SSR/SSG/ISR** — zero server components for data fetching
- **No API routes** — pure SPA talking to external backend
- **Styling:** Tailwind CSS v4 + shadcn/ui (base-maia)
- **State:** React Context + localStorage (no Redux/Zustand)
- **Charts:** Recharts 3.8.0 (10 import sites across 7 components)
- **Animations:** Framer Motion 12.42.2 (8 import sites)
- **Exports:** jsPDF + xlsx (eagerly imported in `lib/export-utils.ts`)
- **Realtime:** Socket.IO Client 4.8.3

---

## Issue #1: No Code Splitting / Dynamic Imports

**Impact: HIGH — Affects every page load**

Every page eagerly loads its entire dependency tree. There are **zero uses** of `next/dynamic` or `React.lazy()` across the entire codebase.

### What gets loaded on every page:
- Full React + React DOM runtime
- Framer Motion (all of it — 8 components import it)
- Recharts (all of it — 7+ components import it)
- shadcn/ui component library (28 UI components)
- jsPDF + jspdf-autotable + xlsx (export libraries — only needed on test-results pages)
- Socket.IO client (only needed on live-test page)
- @iconify/react (only needed on statistics cards)
- All 21 custom hooks

### Fix: Dynamic import heavy libraries

```tsx
// Before (in components/charts/*.tsx):
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

// After:
import dynamic from "next/dynamic";
const BarChart = dynamic(() => import("recharts").then(m => m.BarChart), { ssr: false });
// Or better — wrap entire chart components:
const TopicBarChart = dynamic(() => import("@/components/charts/topic-bar-chart"), {
  ssr: false,
  loading: () => <div className="h-[300px] animate-pulse bg-muted rounded" />,
});
```

```tsx
// For export utilities (lib/export-utils.ts):
// Split into separate files and dynamic import on demand:
const exportToPDF = async (result, user) => {
  const { exportTestResultToPDF } = await import("@/lib/export-pdf");
  exportTestResultToPDF(result, user);
};

const exportToExcel = async (result) => {
  const { exportTestResultToExcel } = await import("@/lib/export-excel");
  exportTestResultToExcel(result);
};
```

```tsx
// For Framer Motion (used in auth pages, theme toggle, live test):
// Replace heavy framer-motion with CSS transitions where possible:
// - auth-page.tsx slide transitions → CSS transform + transition
// - theme-toggle.tsx rotation → CSS @keyframes
// - sign-in-form/sign-up-form entrance → CSS animation

// Or use framer-motion's motion-only import:
import { motion } from "framer-motion/dist/es/index.mjs";
// (Check if tree-shaking is effective in your bundler)
```

### Files to modify:
| File | Change |
|------|--------|
| `components/charts/topic-bar-chart.tsx` | Dynamic import |
| `components/charts/subject-radar-chart.tsx` | Dynamic import |
| `components/charts/performance-trend-chart.tsx` | Dynamic import |
| `components/charts/users-by-location-chart.tsx` | Dynamic import |
| `components/analytics/least-questions-chart.tsx` | Dynamic import |
| `components/analytics/teacher-student-ratio-chart.tsx` | Dynamic import |
| `lib/export-utils.ts` | Split into `export-pdf.ts` + `export-excel.ts`, dynamic import |
| `hooks/use-test-socket.ts` | Dynamic import Socket.IO on live-test page only |

---

## Issue #2: Entire App is Client-Rendered (No SSR/SSG)

**Impact: HIGH — Every page requires full JS download + execution before showing content**

All 25+ pages use `"use client"` with `useEffect` data fetching. This means:
- Users see a blank/loading screen until all JS downloads and executes
- Search engines get minimal pre-rendered content
- No streaming or progressive rendering

### Fix: Convert to Server Components where possible

The **root layout**, **dashboard layout**, and **static pages** can be server components:

```tsx
// app/layout.tsx — already a server component, good

// app/(dashboard)/layout.tsx — convert to server component
// Move "use client" to only the parts that need it:

// app/(dashboard)/layout.tsx (server component):
import { DashboardShell } from "@/components/dashboard-shell";

export default function DashboardLayout({ children }) {
  return <DashboardShell>{children}</DashboardShell>;
}

// components/dashboard-shell.tsx (client component — only what needs interactivity):
"use client";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shadcn-space/blocks/sidebar-06/app-sidebar";
// ... only interactive parts
```

### Fix: Add Route-Level Streaming with loading.tsx

```tsx
// app/(dashboard)/dashboard/loading.tsx
export default function DashboardLoading() {
  return (
    <div className="grid gap-6">
      <div className="h-8 w-48 bg-muted animate-pulse rounded" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    </div>
  );
}
```

### Add error.tsx for error boundaries:

```tsx
// app/(dashboard)/dashboard/error.tsx
"use client";
export default function DashboardError({ error, reset }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground mt-2">{error.message}</p>
      <Button onClick={reset} className="mt-4">Try again</Button>
    </div>
  );
}
```

---

## Issue #3: Redundant Font Loading

**Impact: MEDIUM — Extra font download + FOUT risk**

`app/layout.tsx` loads **two identical Geist fonts**:
- `Geist` as `--font-heading` (line 12)
- `Geist` again as `--font-geist-sans` (line 16)

Both resolve to the same font file. The browser downloads the same woff2 twice.

### Fix: Remove the duplicate

```tsx
// app/layout.tsx — REMOVE this:
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// And remove geistSans.variable from the className on <html>
```

Also consider: do you actually need 3 font families? If headings can use the same Inter body font, you can drop Geist entirely and save a network request.

---

## Issue #4: No Request Caching / Stale-While-Revalidate

**Impact: MEDIUM — Redundant API calls on every navigation**

Every hook re-fetches data from scratch on every mount. No SWR, React Query, or any caching layer.

### Example: `use-student-dashboard.ts`
- 5 API calls on every mount via `Promise.allSettled`
- No caching — navigating away and back re-fetches everything
- No stale-while-revalidate — users always see loading spinners

### Fix: Add a caching layer

```tsx
// Option A: Use React's built-in cache (for Server Components):
import { cache } from "react";
const fetchDashboard = cache(async (token) => { ... });

// Option B: Add SWR (lightweight, ~4KB):
// npm add swr
import useSWR from "swr";

export function useStudentDashboard() {
  const { token } = useAuth();
  const fetcher = (url: string) => fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(r => r.json());

  const { data, error, isLoading } = useSWR(
    token ? '/api/dashboard/stats' : null,
    fetcher,
    { revalidateOnFocus: true, dedupingInterval: 30000 }
  );
  // ...
}
```

---

## Issue #5: Monolithic API Client

**Impact: MEDIUM — Full 1256-line API module bundled even when only 1-2 endpoints are used**

`lib/api.ts` is a single 1256-line file containing:
- All TypeScript interfaces (~500 lines)
- All API functions (~750 lines)
- A shared `apiRequest<T>()` helper

Every page that imports any API function gets the entire module.

### Fix: Split by domain

```
lib/
  api/
    client.ts          # Shared apiRequest<T>() helper
    auth.ts            # authApi (signup, login, logout)
    users.ts           # usersApi
    courses.ts         # coursesApi
    subjects.ts        # subjectsApi
    topics.ts          # topicsApi
    questions.ts       # questionsApi
    enrollments.ts     # enrollmentsApi
    tests.ts           # testsApi + predefinedTestsApi
    dashboard.ts       # dashboardApi
    locations.ts       # locationsApi
    types.ts           # All TypeScript interfaces
    index.ts           # Re-exports for backward compatibility
```

This enables tree-shaking — only the API functions actually imported get bundled.

---

## Issue #6: Large Third-Party Libraries Without Lazy Loading

**Impact: MEDIUM-HIGH — Bundle bloat on all pages**

| Library | Size (approx) | Where Used | Pages That Need It |
|---------|---------------|------------|-------------------|
| Recharts | ~200KB gzipped | 7 chart components | Dashboard, Analytics, Student Dashboard, Teacher Dashboard |
| Framer Motion | ~40KB gzipped | 8 components | Auth pages, Live Test, Theme Toggle |
| jsPDF | ~80KB gzipped | export-utils.ts | Test Results only |
| jspdf-autotable | ~30KB gzipped | export-utils.ts | Test Results only |
| xlsx | ~150KB gzipped | export-utils.ts | Test Results only |
| Socket.IO | ~50KB gzipped | use-test-socket.ts | Live Test only |
| @iconify/react | ~20KB gzipped | statistics-card.tsx | Dashboard KPI cards |

**Total unnecessary JS on sign-in page: ~570KB+**

### Fix: Dynamic import all heavy libraries

```tsx
// lib/export-utils.ts → split into:
// lib/export-pdf.ts    (jsPDF + jspdf-autotable)
// lib/export-excel.ts  (xlsx)

// Import on demand in the component that triggers export:
const handleExportPDF = async () => {
  const { exportTestResultToPDF } = await import("@/lib/export-pdf");
  exportTestResultToPDF(result, user);
};
```

---

## Issue #7: No Route-Level Loading States

**Impact: MEDIUM — Users see blank content during navigation**

Zero `loading.tsx` files exist in the app. When navigating between dashboard pages, users see nothing until the new page's JS loads and renders.

### Fix: Add loading.tsx to all route groups

```tsx
// app/(dashboard)/loading.tsx
export default function DashboardLoading() {
  return <DashboardSkeleton />;
}

// app/(test)/loading.tsx
export default function TestLoading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}
```

---

## Issue #8: Accessibility Failures (Lighthouse: 82/100)

**Impact: MEDIUM — Usability and compliance**

| Audit | Status | Fix |
|-------|--------|-----|
| `button-name` | FAIL | Add `aria-label` to icon-only buttons (Bell button, SidebarTrigger) |
| `color-contrast` | FAIL | Check oklch color values meet 4.5:1 ratio for text |
| `heading-order` | FAIL | Ensure headings don't skip levels (h1 → h3 without h2) |
| `landmark-one-main` | FAIL | Wrap main content in `<main>` landmark |
| `target-size` | FAIL | Ensure touch targets are at least 24x24px |

### Specific fixes:

```tsx
// Bell button (app/(dashboard)/layout.tsx:72):
<Button variant="ghost" size="icon" className="relative h-9 w-9" aria-label="Notifications">
  <Bell className="h-5 w-5" />
</Button>

// ThemeToggle (components/theme-toggle.tsx):
// Add aria-label for the toggle button

// SidebarTrigger:
// Add aria-label="Toggle sidebar"
```

---

## Issue #9: CSS Universal Selector Rules

**Impact: LOW — Slightly slows rendering**

`globals.css` applies `scrollbar-width: thin` and `scrollbar-color` to **every element** via `*` selector (line 156-159). This forces the browser to evaluate scrollbar styles for every element in the DOM.

### Fix: Target only scrollable containers

```css
/* Before: */
* {
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}

/* After: */
.scrollable,
[data-slot="dialog-content"],
main,
aside {
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}
```

---

## Issue #10: No Next.js Performance Config

**Impact: LOW-MEDIUM — Missing optimization opportunities**

`next.config.ts` is nearly empty — only has `allowedDevOrigins`. Missing:

```ts
const nextConfig: NextConfig = {
  // Compress responses
  compress: true,

  // Optimize images
  images: {
    formats: ["image/avif", "image/webp"],
  },

  // Enable SWC minification (default in Next.js 16, but explicit)
  swcMinify: true,

  // Analyze bundle in development
  // (add @next/bundle-analyzer for analysis)

  // Power by header removal
  poweredByHeader: false,

  // Strict mode for better React warnings
  reactStrictMode: true,
};
```

---

## Issue #11: LiveDateTime Re-renders Every Second

**Impact: LOW — Unnecessary re-renders in dashboard layout**

`app/(dashboard)/layout.tsx` has a `LiveDateTime` component that calls `setInterval(() => setNow(new Date()), 1000)`. This triggers a re-render of the **entire dashboard layout** every second, including sidebar, header, and all children.

### Fix: Isolate the re-render

```tsx
// Option A: Use CSS animation for the clock (no JS re-renders)
// Option B: Use requestAnimationFrame + CSS text update
// Option C: Memoize children to prevent cascade re-renders

// At minimum, memoize the layout children:
const DashboardLayout = React.memo(function DashboardLayout({ children }) {
  // ...
});
```

---

## Priority Implementation Roadmap

### Phase 1: Quick Wins (1-2 days)
1. **Remove duplicate Geist font** — saves 1 font request
2. **Add `loading.tsx`** to all route groups — instant perceived performance
3. **Fix accessibility** — button labels, contrast, landmarks
4. **Add `next.config.ts`** optimizations — compress, images, poweredByHeader

### Phase 2: Code Splitting (2-3 days)
5. **Dynamic import Recharts** — wrap all 7 chart components
6. **Dynamic import export utils** — split jsPDF/xlsx into lazy chunks
7. **Dynamic import Socket.IO** — only load on live-test page
8. **Dynamic import Framer Motion** — or replace with CSS animations

### Phase 3: Architecture (3-5 days)
9. **Convert layouts to Server Components** — move "use client" down
10. **Split `lib/api.ts`** into domain modules for tree-shaking
11. **Add SWR or React Query** — caching + deduplication
12. **Add error.tsx** boundaries to all route groups

### Phase 4: Advanced (1-2 weeks)
13. **Implement ISR/SSG** for public-facing pages (join/[token], test-result)
14. **Virtualize data tables** — use `@tanstack/react-virtual` for large lists
15. **Add performance monitoring** — Web Vitals reporting to analytics
16. **Optimize CSS** — reduce universal selectors, purge unused Tailwind classes

---

## Expected Impact Summary

| Metric | Current | After Phase 1-2 | After All Phases |
|--------|---------|------------------|------------------|
| JS bundle (sign-in page) | ~570KB+ unnecessary | ~200KB reduction | ~400KB+ reduction |
| LCP | 1,948ms | ~1,500ms | ~800ms |
| FCP | ~2,000ms | ~1,200ms | ~600ms |
| Accessibility | 82/100 | 95/100 | 98/100 |
| Time to Interactive | ~4s+ | ~2.5s | ~1.5s |
| Perceived load time | Slow (blank screen) | Medium (skeleton) | Fast (progressive) |

---

## Files Reference

| File | Relevance |
|------|-----------|
| `app/layout.tsx` | Font loading, metadata |
| `app/globals.css` | Universal CSS rules |
| `app/(dashboard)/layout.tsx` | LiveDateTime re-renders, accessibility |
| `next.config.ts` | Missing performance config |
| `lib/api.ts` | Monolithic 1256-line API client |
| `lib/export-utils.ts` | Eagerly loaded jsPDF + xlsx |
| `hooks/use-student-dashboard.ts` | No caching, 5 parallel fetches |
| `hooks/use-admin-analytics.ts` | No caching, 4 parallel fetches |
| `components/charts/*.tsx` | 7 chart components importing Recharts |
| `components/auth/auth-page.tsx` | Framer Motion on auth page |
| `components/theme-toggle.tsx` | Framer Motion for toggle animation |
| `app/(test)/live-test/page.tsx` | Socket.IO + Framer Motion loaded eagerly |
