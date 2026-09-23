# Chapter3 — How the Application Works

> **Part:** I — Understanding the Application · **Phase:**3
> **Covers:** architecture, request lifecycle, error envelope, real-time channel, caching
> **Roles:** all (technical orientation — no permissions needed)

## In this chapter
- The two pieces of the system and what runs where
- What happens, step by step, when you click something
- Why data arrives when it does (and why dashboards lag a few minutes)

## Getting here
- **Applies to:** the whole application (conceptual chapter)
- **Live check you can run:** open `http://localhost:5001/health` in a browser

## The big picture

```
        ┌────────────────────────── Browser ──────────────────────────┐
        │  Next.js frontend  :3000                                   │
        │   • renders every screen (route groups: (auth)/(dashboard)/(test))
        │   • guards: RouteGuard + role rules →404 for wrong role    │
        │   • data calls: fetch("/api/…")  ────── rewrites ──────┐    │
        │   • live tests: Socket.IO  ──────────────────────┐     │    │
        └──────────────────────────────────────────────────┼─────┼────┘
                                                           │     │
                              /api/* proxy (same origin)   │     │ direct WS
                                                           ▼     ▼
        ┌──────────────────── Express backend :5001 ──────────────────┐
        │  CORS • cookies • JSON body • request logger                │
        │  GET /health                                                │
        │  /api gateway: route rule → authenticate (cookie or Bearer) │
        │                 → authorize (role) → controller → service   │
        │  Socket.IO (same process; short-lived "ticket" handshake)   │
        └──────────────┬──────────────────────────────┬───────────────┘
                       ▼                              ▼
                PostgreSQL (Sequelize)              Redis
                all15 tables                        login sessions/revocation,
                                                    dashboard caches (~5 min)
```

Two processes in development: the **frontend** (`:3000`) and the **backend** (`:5001`). The browser never talks to `:5001` for data — every `/api/…` call is same-origin and proxied by the frontend, which is what lets the session cookies (Ch4) work without JavaScript ever seeing them. The live-test connection is the one exception: it connects directly to the backend and authenticates with a short-lived **ticket** fetched just before connecting (Ch11).

<!-- img: ch03-backend-health -->

## A typical request, step by step

Example: opening **"My Enrollments"**.

1. The route guard confirms you are signed in and your role may open `/dashboard/enrollments`.
2. The page's data hook asks SWR for `GET /api/enrollment?page=1&limit=10`.
3. The request goes to the frontend origin, which proxies it to the backend.
4. The API gateway matches a route rule for `/api/enrollment` → requires authentication → requires role `student`.
5. Authentication reads the `access_token` cookie (or `Authorization` header), verifies it, and checks it hasn't been revoked.
6. Controller → service → Sequelize runs a scoped query (your enrollments only) against PostgreSQL.
7. The response comes back in the standard envelope and SWR renders the table; the sidebar stays interactive throughout.

If step5 finds a lapsed (but otherwise valid) session, the frontend **silently refreshes** it (Ch4) and retries the call — you usually notice nothing.

## The response envelope and errors

Every API response — success or failure — has the same shape:

```json
{ "statusCode": 400, "success": false, "message": "Validation failed: …", "data": null }
```

| Status | You'll see | Meaning |
|---|---|---|
|400 | `Validation failed: field: rule; field: rule` | input rejected — messages tell you exactly what to fix |
|401 | `Invalid credentials` or a bounce to sign-in | wrong email/password, or the session ended and renewal failed |
|403 | (permission error) | authenticated, but your role isn't allowed |
|404 | `Route not found` (API) / "404" page (UI) | wrong URL, or a page outside your role |
|429 | `Too many attempts. Please wait a minute and try again.` | login/signup rate limit (Ch4) |
|500 | `Internal server error` | backend failure — retry, then report |

Full catalog with every message text: Appendix E.

## The real-time test channel

Live tests don't poll — they hold a WebSocket:

1. Before entering a test room the app exchanges your session for a **ticket** (`POST /api/user/socket-ticket`, valid5minutes).
2. The socket connects with that ticket, joins a room named after the test, and every answer, skip and heartbeat travels over it.
3. The server keeps a countdown (`time_update`), records answers as you go, and **auto-submits on timeout**; if no heartbeat arrives for60 seconds the session is marked *abandoned*.

You never manage this by hand — but it explains why a dropped connection shows a resume prompt instead of losing your work (Ch11).

## Why dashboards aren't instant

Read-heavy numbers (admin/teacher/student KPIs, topic/performance series, location analytics) are **cached in Redis for about5 minutes**. Reports and charts are therefore up to five minutes behind live data by design; tables and lists are live. If a just-completed test doesn't show up in a chart yet, wait a few minutes — this is expected (Ch30 explains each metric's source).

## Roles & permissions
Enforced at three consistent layers: **sidebar** (you only see what your role can use), **route guard** (wrong role →404 page), **API gateway** (wrong role →403). One role, one truth — details in [Ch4](ch04-sessions-security-permissions.md).

## When things go wrong

| You see | Because | Fix |
|---|---|---|
| Spinner never resolves; tables stuck loading | backend not reachable | check `http://localhost:5001/health` (Ch5) |
| A fetch error says `Route not found` inside a working page | the frontend expects an endpoint the running backend doesn't have (version skew after an update) | reload; if it persists, restart both apps (Ch5) |
| `Internal server error` on an action | backend fault — your action likely did **not** save | retry once; if repeated, report the action + time |
| Chart misses data you can see in a table | ~5-minute dashboard cache | wait, then refresh |

## Related
- **Chapters:** [Ch4 — Sessions, Security & Permissions](ch04-sessions-security-permissions.md) · [Ch5 — Getting Started](ch05-getting-started.md) · [Ch11 — The Live Test Room](ch11-live-test-room.md)
- **Appendices:** C (API reference), E (error catalog)
