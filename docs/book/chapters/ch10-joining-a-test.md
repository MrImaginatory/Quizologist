# Chapter10 — Joining a Test

> **Part:** IV — Taking Tests · **Phase:**6
> **Covers:** P26 (canonical share-link join), P25 legacy footnote (**A01**), schedule gating, token scrubbing (audit HIGH-03)
> **Roles:** any authenticated user (typically the assigned student)

## In this chapter
- Where share links come from and what they look like
- Opening a link — sign-in return, URL scrubbing, the join card
- Every Start-button state (active status, schedule window)
- Invalid/expired links
- The legacy `/join/…` variant (footnote, A01)

## Getting here
- **From:** a link someone sent you (email/chat) — produced by **Copy link** on the test-management screens ([Ch19](ch19-designing-managing-tests.md) for teachers, Ch28 for admins)
- **Ends at:** `/live-test?id=…` — the room described in [Ch11](ch11-live-test-room.md)

## What a share link looks like
```
{origin}/test/join/{slug}_{start-time|noschedule}_{end-time|noschedule}_{token}
```
- The last `_`-separated segment is the real **token**; everything before it is a human-readable slug (test name + schedule markers)
- Bare-token links (`/test/join/<uuid>`) work too
- Students can always reach assigned tests by browsing ([Ch9](ch09-available-tests-pre-assessment.md)) — links are the shortcut, not the only way in

## Opening a link
1. **Signed out?** The page stashes your destination (`redirectAfterLogin`) and sends you to `/signin` — after signing in you land back on the link automatically (Ch5).
2. **Signed in?** The token is extracted, saved to `sessionStorage`, and the address bar is immediately **scrubbed**: the URL is replaced with **`/test/join/joined`** so the secret token never lingers in browser history, Referer headers or server logs (security audit **HIGH-03**).
3. The test's details load (`GET /api/test/predefined/join/{token}`) and the card below renders.

> **Note:** the cleaned URL only remembers the token in **that tab**. Refreshing works; pasting the cleaned `/test/join/joined` URL into another browser won't — always share the *original* link.

<!-- img: ch10-join-test-card -->

## The join card
- App **logo** on top; test **title** + **status badge** — **Active** (green) or the capitalized status (gray)
- Description (if the test has one)
- Three fact tiles: **Duration** (`… minutes`) · **Questions** (`…`) · **Difficulty** (capitalized)
- **Scheduled Test** box (scheduled tests only): `Start:` / `End:` in your local time; outside the window an orange notice appears: *"This test is not available at this time"*
- Full-width **Start** button (states below)
- Footer: **"Taking test as: {your name}"** — verify it's the right account before starting

## Start-button states

| Condition | Button | Enabled |
|---|---|:-:|
| Test not active (not yet activated by staff) | **Test Not Active** | ✗ |
| Scheduled but outside the start/end window | **Not Available Yet** | ✗ |
| Active and inside the window (or unscheduled) | **▶ Start Test** | ✓ |

**Start** → `POST /api/test/predefined/{id}/start` → toast **"Test started!"** → `/live-test?id={attempt}` ([Ch11](ch11-live-test-room.md)).

## When things go wrong
| You see | Because | Fix |
|---|---|---|
| **Invalid or Expired Link** — *"This test link is invalid or no longer available. Please request a new link."* | bad/expired token, or a cleaned URL opened where `sessionStorage` has no token (fresh tab/incognito) | ask for a fresh link; open it in the original tab |
| **Unable to Load Test** + message | server rejected the token or is unreachable | check the link, then backend health ([Ch5](ch05-getting-started.md)) |
| **Test Not Active** | staff hasn't activated the test | ask your teacher/admin (Ch19/Ch29) |
| **Not Available Yet** / orange schedule notice | outside the scheduled window | wait for the announced window (times shown locally) |
| Sent to `/signin` | session expired | sign in — you return to the link automatically |
| "Taking test as" shows the wrong name | you're signed in as the wrong account | sign out, sign in as yourself (Ch5) |

<!-- img: ch10-join-invalid-link -->

> **Footnote (A01):** a second, older join page exists at **`/join/[token]`**. It shows the same details in a plainer card (no logo, no status badge), **doesn't** gate its Start button on active status or schedule, scrubs to `/join/joined`, and nothing in the app generates links to it. Treat any `/join/…` URL you find as a legacy equivalent of the canonical `/test/join/…` link above.

## Roles & permissions
Any signed-in user with a valid token sees this card — tokens are handed out per test, and the footer always shows whose account would take it. The attempt created by **Start** belongs to that account; the room itself loads only the test data the server lets you have ([Ch4](ch04-sessions-security-permissions.md)).

## Related
- **Chapters:** [Ch5 — Sign-in return](ch05-getting-started.md) · [Ch9 — Available Tests (browse instead of link)](ch09-available-tests-pre-assessment.md) · [Ch11 — Live Test Room](ch11-live-test-room.md) · [Ch19](ch19-designing-managing-tests.md) / Ch28 — Copy link (admin)
- **Screens:** P26 (canonical), P25 (legacy) · **Anomalies:** A01 · **Appendices:** C (join API) · E · G (HIGH-03)
