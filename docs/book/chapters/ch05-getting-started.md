# Chapter5 — Getting Started

> **Part:** II — Getting Started · **Phase:**4
> **Covers:** P01, P02, F01 (sign-in), F02 (sign-up), RL1/RL2, environment & seeding
> **Roles:** all

## In this chapter
- Install and run both halves of the application (backend + frontend)
- Every environment variable explained — required vs optional
- Your first visit, the sign-in and sign-up walkthroughs, and every message they can produce
- Logging out, plus startup troubleshooting

## Getting here
- **From:** a fresh checkout of this repository
- **Ends at:** `/signin` signed in, landing on `/dashboard`

## What you need

| Requirement | Version / value |
|---|---|
| Node.js | ≥18 (Node20+ recommended for Next16) |
| pnpm | ≥8 (`npm i -g pnpm`) — both apps use pnpm |
| PostgreSQL | running, with a database + user for the app |
| Redis | running (sessions & refresh tokens depend on it) |
| Ports | backend **:5001**, frontend **:3000** must be free |

## Run the backend

```bash
cd backend-mono
pnpm install
cp .env.example .env      # then edit — see the tables below
pnpm dev                  # nodemon + ts-node → http://localhost:5001
```

Verify: open **`http://localhost:5001/health`** — you should get a JSON status response.

<!-- img: ch03-backend-health -->

On first boot the server **connects the database, creates any missing tables, and seeds** (see below). Production runs use `pnpm build` then `pnpm start`.

> **Note:** the server **refuses to start if any required variable is missing or empty** — it prints *all* missing ones in one list, so fix everything it reports in a single pass.

## Run the frontend

```bash
cd frontendJkShah
pnpm install
# .env — see the frontend table below (BACKEND_URL is the important one)
pnpm dev                  # → http://localhost:3000
```

The frontend proxies every `/api/…` call to the backend **server-side** (`next.config.ts` rewrite → `BACKEND_URL`), which is what keeps your session cookies first-party — nothing to configure in the browser.

## Environment reference

### Backend — `backend-mono/.env` (all required)

Copy `.env.example` → `.env`. **Every variable below is mandatory** — the server exits with a combined error list if any is missing/empty.

| Variable | Example | Purpose |
|---|---|---|
| `PORT` | `5001` | API + socket port |
| `NODE_ENV` | `development` | `development` \| `production` (controls error detail, logging, CORS warnings) |
| `DB_HOST` / `DB_PORT` | `localhost` / `5432` | PostgreSQL location |
| `DB_NAME` / `DB_USER` / `DB_PASSWORD` | `jkshah_quizologist` / `postgres` / … | database credentials |
| `DB_ALTER_TABLES` | `false` | `true` = alter existing tables on boot ⚠ |
| `DB_DROP_TABLES` | `false` | `true` = **drop & recreate** tables on boot ⚠⚠ data loss |
| `DB_POOL_MAX` / `DB_POOL_MIN` | `20` / `5` | connection pool size |
| `DB_POOL_ACQUIRE` / `DB_POOL_IDLE` | `30000` / `10000` | pool timeouts (ms) |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` | comma-separated allowed browser origins; production + dev/tunnel origins triggers a startup **warning** |
| `REDIS_URL` | `redis://localhost:6379` | sessions, revocation, dashboard caches |
| `JWT_SECRET` | *(generate: `openssl rand -base6464`)* | **must be ≥32 characters** — server refuses shorter values |
| `JWT_EXPIRES_IN` | `7d` | refresh-session lifetime (access sessions last15 min) |
| `BCRYPT_SALT_ROUNDS` | `10` | password hashing cost |
| `MIN_ATTEMPTS` | `3` | minimum attempts before skill/attempt rules kick in |
| `PREDEFINED_TEST_MIN_DEACTIVATE_MINUTES` | `5` | how close to start time a test can no longer be deactivated |
| `LOG_LEVEL` | `info` | `debug` \| `info` \| `warn` \| `error` |

> **Warning:** `DB_DROP_TABLES=true` erases all data on startup. Leave both DB flags `false` outside deliberate maintenance.

### Frontend — `frontendJkShah/.env`

| Variable | Required | Example | Purpose |
|---|---|---|---|
| `BACKEND_URL` | **yes** | `http://localhost:5001` | target of the server-side `/api` proxy (not exposed to the browser) |
| `NEXT_PUBLIC_API_URL` | for live tests | `http://localhost:5001` | direct WebSocket address used by test rooms |
| `NEXT_PUBLIC_APP_NAME`, `_LOGO`, `_DESCRIPTION`, `_TAGLINE` | no | brand strings | identity/branding |
| `NEXT_PUBLIC_AUTH_*` (`WELCOME_/SIGNIN_/SIGNUP_ TITLE & SUBTITLE`, `TRUSTED_TEXT`) | no | copy strings | sign-in/sign-up page copy |
| `NEXT_PUBLIC_ANALYTICS_URL` | no | *(unset = disabled)* | optional web-vitals beacon endpoint (production only) |

> **Warning:** **never set `NEXT_PUBLIC_BACKEND_URL`.** It bypasses the proxy, breaks HttpOnly-cookie sign-in, and must stay unset.

## The seeded admin account

First successful boot seeds two things (idempotent — never duplicates):

1. A **central location**: "Admin HQ — New Delhi,110001" (`is_central`, protected from edit/delete).
2. The **admin account**:

| | |
|---|---|
| Email | **admin@quizologist.com** |
| Password | **Admin@123** |

Both are printed to the backend console on first run.

> **Warning:** these are well-known development defaults. Before exposing the system to anyone else, replace the admin credentials (provisioning/DB update) and assign a real location strategy (Ch21).

## First visit

1. Open `http://localhost:3000`.
2. The root page (P01) checks your session: signed in → `/dashboard`; not → `/signin`.
3. You arrive at the sign-in screen — your **landing view** (there is no separate marketing page).

<!-- img: ch05-signin-default -->

## Signing in (F01)

| # | Field | Type | Required | Notes |
|--:|---|---|:-:|---|
|1| Email | `email` | ✓ | the address you registered |
|2| Password | `password` (+ show/hide eye) | ✓ | |

**Walkthrough**
1. Enter email and password (the eye icon toggles visibility).
2. Press **Sign in**.
3. On success the session cookies are set and you land on `/dashboard` — role-appropriate home (Ch6/14/20).
4. On failure an **"Invalid credentials"** banner appears above the form.

<!-- img: ch05-invalid-credentials -->

> The message is deliberately identical for a wrong email and a wrong password — it can't confirm which accounts exist (Ch4).

- **"Forgot password?"** appears under the form but is **not yet functional** — no reset flow exists; contact your administrator.
- Hitting the limit produces `Too many attempts. Please wait a minute and try again.` — **5 sign-ins per minute**, then a60-second cool-down (**RL1**).

<!-- img: ch05-rate-limit-429 -->

## Creating an account (F02)

Self-signup offers **Student** and **Teacher** (admin accounts are provisioned, not self-registered).

<!-- img: ch05-signin-to-signup -->

| # | Field | Type | Required | Validation |
|--:|---|---|:-:|---|
|1| First Name | text | ✓ | required |
|2| Last Name | text | ✓ | required |
|3| I am a | select | ✓ | **Student** (default) \| **Teacher** |
|4| Email | `email` | ✓ | must be a valid format |
|5| Mobile Number | `tel` | ✓ | **digits only, exactly10** (`x/10 digits` counter) |
|6| Password | `password` + strength meter | ✓ | ≥12 chars + strength ≥3/5 (Ch4) |
|7| Confirm Password | `password` | ✓ | must match password (checked live) |

**Walkthrough**
1. On the sign-in screen choose the switch to **Sign up**.
2. Fill the seven fields; watch the password checklist turn green.
3. Press **Sign up**.
4. Success: your account is created **and signed in immediately** — the server sets the session cookies, and you're redirected into `/dashboard`.
5. Failure: a banner shows the exact rule(s) that failed, e.g.

```
Validation failed: password: Password must be at least 12 characters;
Password is too easy to guess — avoid common words, names, dates and
sequences. Try a passphrase of unrelated words.
```

- Type mismatches are caught in the browser first: `Passwords do not match`.
- Registration allows **3 accounts per minute** per network (**RL2**), same `Too many attempts…` message.
- Names are stored lower-cased (Ch4) — "Jane Doe" displays as "jane doe".

## Logging out — and session life

- **Where:** avatar menu (top-right) ▸ **Logout**, or the logout icon in the sidebar footer.
- **What happens:** the server revokes your session credentials (not just a browser clear) and both cookies are removed — a copied cookie can't be reused.
- While you work, access sessions renew invisibly every ~15 minutes; after closing the browser you simply sign in next time (Ch4 for the full model).

## When things go wrong

### Starting the apps

| You see | Because | Fix |
|---|---|---|
| Server exits: `Missing/empty environment variables: PORT, JWT_SECRET, …` | `.env` incomplete — **all** offenders listed together | copy `.env.example`, fill every listed key, restart |
| `JWT_SECRET must be at least32 characters` | short/placeholder secret | `openssl rand -base6464` into `JWT_SECRET` |
| Postgres connection error (`password authentication failed`, `ECONNREFUSED:5432`) | DB not running or wrong `DB_*` values | start PostgreSQL; align `DB_HOST/PORT/NAME/USER/PASSWORD` |
| Redis errors on sign-in/refresh | Redis not running | start Redis at `REDIS_URL` (sessions require it) |
| `EADDRINUSE` on :5001 or :3000 | another process holds the port | stop it, or change `PORT` / run one frontend only |
| `[security] CORS… dev origins in production` warning | `NODE_ENV=production` with localhost/tunnel origins | list only your real origins in `CORS_ALLOWED_ORIGINS` |
| Every data call fails while pages render | `BACKEND_URL` wrong/unset, or backend down | fix `.env`, restart `pnpm dev` (env is read at boot), check `/health` |

### Signing in / signing up

| You see | Because | Fix |
|---|---|---|
| `Invalid credentials` | wrong email/password (generic by design) | retry; use the seeded admin or your own registration |
| `Too many attempts. Please wait a minute and try again.` | RL1/RL2 window hit | wait60 seconds — don't hammer it |
| `Validation failed: …` (one clear line) | a signup field broke a rule | follow the named rule(s); password rules in Ch4 |
| `Passwords do not match` | confirmation differs | retype both fields |
| "404 — Page not found" right after login | that URL isn't allowed for your role | use your sidebar (matrix in Ch4) |
| You expected a "forgot password" reset | flow not implemented | contact your administrator |

## Roles & permissions
Every role uses this chapter identically — sign-in and the environment are shared. Differences start *after* login: **student → Ch6**, **teacher → Ch14**, **admin → Ch20**. Self-signup can only create student/teacher accounts; the admin account comes from the seed.

## Related
- **Chapters:** [Ch1 — What Is Quizologist](ch01-what-is-quizologist.md) · [Ch3 — How the Application Works](ch03-how-application-works.md) · [Ch4 — Sessions, Security & Permissions](ch04-sessions-security-permissions.md) · [Ch6 — Your Dashboard](ch06-your-dashboard.md)
- **Screens:** P01, P02 · **Forms:** F01, F02 · **Limits:** RL1, RL2 · **Appendices:** C (API), E (errors), G (security)
