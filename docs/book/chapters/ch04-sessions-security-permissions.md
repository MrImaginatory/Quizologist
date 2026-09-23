# Chapter4 — Sessions, Security & Permissions

> **Part:** I — Understanding the Application · **Phase:**3
> **Covers:** sessions (cookies), password policy (F02), rate limits (RL1/RL2), roles × features matrix
> **Roles:** all

## In this chapter
- How you stay signed in — and what "signed out" really means
- The password rules and exactly which messages they produce
- Rate limits, name handling, and the full who-can-do-what matrix

## Getting here
- **Applies to:** the whole application; visuals shown on `/signin` (sign-up mode)

## How you stay signed in

Signing in (or registering) makes the backend set **two session cookies** in your browser:

| Cookie | Lifetime | What it does |
|---|---|---|
| Access session | **15 minutes** | authenticates every API call; renewed invisibly while you work |
| Refresh session | **7 days**, sliding | used only to mint a new access session when the old one lapses |

Both are **HttpOnly** (JavaScript on the page can't read them — which is what keeps them safe from script injection) and **SameSite=Strict** (your browser sends them only to this site, never along with links from elsewhere). They live in the browser, not in the page: no tokens appear in URLs, and `localStorage` holds only your display name and a session hint.

What this means day-to-day:

- Working continuously never interrupts you — renewal happens on your behalf a moment before a call would fail.
- Close the browser after **Logout** (avatar menu ▸ Logout) and the session is gone; logout also revokes the underlying credentials server-side, so a copied cookie can't be replayed.
- A session that expires while a tab sleeps puts you back at sign-in — that's the only time you'll be asked for your password unexpectedly.

## Password rules

The sign-up form enforces a **strength-checked password**:

<!-- img: ch04-password-policy-enforced -->

| Rule | Value | Typical server message |
|---|---|---|
| Length | **12–100 characters** | `Password must be at least 12 characters` |
| Strength | must not be trivially guessable (common words/patterns rejected) | `Password is too easy to guess — avoid common words, names, dates and sequences. Try a passphrase of unrelated words.` |
| Confirmation | both fields must match (checked in the browser) | `Passwords do not match` |

> **Tip:** a passphrase of3–4 unrelated words (e.g. `CopperLamp-River7Tide`) satisfies every rule and is easy to remember. `Jane@123` fails **both** rules — too short *and* a common pattern.

Other sign-up guards: email must be well-formed, mobile number is exactly **10 digits**, role choices are Student/Teacher (admin accounts are provisioned, not self-registered). Validation failures come back as one clear line, e.g. `Validation failed: password: Password must be at least 12 characters; …`.

## Rate limits — anti-brute-force

| Action | Limit | Message when hit |
|---|---|---|
| Sign-in attempts | **5 per minute** per network | `Too many attempts. Please wait a minute and try again.` |
| Registrations | **3 per minute** per network | same message |

The window resets60 seconds after your first attempt. Waiting is the only remedy — this protects accounts against password guessing; if you're on a shared network, one colleague's mistakes can briefly affect everyone.

## A note on how names are stored
Names are normalised on save: **stored in lowercase** and stripped of HTML/control characters (a safety measure). "Jane Doe" is therefore displayed as "jane doe" throughout the app today. Content inside test answers and question text is not altered this way.

## Roles & permissions — the full matrix

| Capability | Student | Teacher | Admin |
|---|:-:|:-:|:-:|
| Sign in · create account (self-signup = student/teacher) | ✓ | ✓ | provisioned |
| Dashboard home (own role's view) | ✓ | ✓ | ✓ |
| My Enrollments (take learning) | ✓ | — | — |
| My Tests · Available Tests · take live/time-based tests | ✓ | — | — |
| View own results (`/test-result`) | ✓ | — | — |
| Teaching enrollments | — | ✓ | — (screen opens empty) |
| Student directory (`/dashboard/students`) | — | ✓ | ✓ |
| Question bank: view/create/edit/delete | — | ✓ | ✓ |
| Import questions from Excel | — | ✓ | ✓ (+ create missing courses/subjects/topics) |
| Tests: view/create/manage/detail/student results | — | ✓ | ✓ (sees **all** students' attempts; teacher sees teaching scope) |
| User rosters (All/Students/Teachers) + assign location | — | — | ✓ |
| Student profile & performance detail | — | — | ✓ |
| Courses / Subjects / Topics (content hierarchy) | — | — | ✓ |
| Locations | — | — | ✓ |
| Analytics dashboard | — | — | ✓ |

Notes:
- Teachers author **within their assigned teaching scope** (Ch15); admins see everything.
- A page outside your role renders as **"404 — Page not found"** (deliberate — it doesn't advertise what exists); the API answers such attempts with403.
- Two pages are shared (admin+teacher) but behave differently by role — those differences are called out where each screen is documented (Ch16–19, Ch27–28).

## When things go wrong

| You see | Because | Fix |
|---|---|---|
| `Invalid credentials` | email or password wrong — the message is intentionally generic so it can't confirm which accounts exist | re-check both; password manager recommended |
| `Too many attempts. Please wait a minute and try again.` | hit RL1/RL2 | wait60s, try once more |
| `Password must be at least 12 characters` / `too easy to guess` | policy rejection (see above) | use a passphrase; watch the strength checklist |
| `Passwords do not match` | confirmation field differs | retype both |
| Suddenly back at sign-in after hours idle | session expired and renewal failed (signed out) | sign in again (Ch5) |
| "404 — Page not found" on a link you were given | your role isn't allowed there | ask for a role-appropriate link, or use your own sidebar |
| You logged out but are worried about a shared PC | cookies for this site were cleared on logout | also close the browser; nothing of yours remains in the page (Ch3) |

## Related
- **Chapters:** [Ch5 — Getting Started](ch05-getting-started.md) (actual sign-in/sign-up walkthrough) · [Ch3 — How the Application Works](ch03-how-application-works.md)
- **Screens:** F01/F02 (sign-in/up), RL1/RL2 · **Appendices:** D (permissions), E (errors), G (security model)
