# Chapter11 — The Live Test Room

> **Part:** IV — Taking Tests · **Phase:**6
> **Covers:** P27 `/live-test`, palette, timer, auto-save, socket events, disconnect/heartbeat, submit & cancel
> **Roles:** built for students (the route group only requires a signed-in session; attempts are student-scoped server-side)

## In this chapter
- What you see when the room loads — header, question area, palette
- How answers save themselves (socket + local recovery)
- The countdown, heartbeat and disconnect rules
- The submit gate, confirmation and results screen
- Cancelling — and why pre-assessment tests won't let you

## Getting here
- **From:** [Ch8](ch08-my-tests.md) Start Test / Resume · [Ch9](ch09-available-tests-pre-assessment.md) predefined Start · [Ch10](ch10-joining-a-test.md) join link — all land on **`/live-test?id={attempt}`**
- Loading: *"Loading test…"* spinner (`(test)/loading.tsx`); route-level failures use `(test)/error.tsx`

<!-- img: ch11-live-test-room -->

**Error card:** *"Oops! Something went wrong"* with **View Test History** → `/dashboard/my-tests`. One special case: if the server says *"This test has already been completed"*, the card reads *"This test has already been completed. You can view your results in the test history."*

## The header
| Element | Behavior |
|---|---|
| Logo tile + dot | **green = Connected**, **red = Disconnected** (hover the dot for the word) |
| App name | branded (`NEXT_PUBLIC_APP_NAME`) |
| `test_id` badge | mono, hidden on small screens — the same ID tiled across the watermark |
| Theme toggle | Sun/Moon — the room remembers your choice |
| Timer pill | `mm:ss`; turns **red ≤60 seconds** |
| **Cancel** (✕) | destructive — opens the cancel modal. **Hidden while taking a pre-assessment** (A13): those must be finished or timed out |

## The question area
- Counter **`n/total`** plus badges: **Difficulty** (beginner emerald · normal blue · mid amber · hard orange · expert red), **Course**, **Subject**
- Question text with any leading number stripped and re-renumbered to match your position
- Choices **A, B, C…** as full-width rows; **clicking one saves it immediately** (selected = primary border, filled letter circle, ✓)
- Background **watermark**: your `test_id` tiled diagonally at ~8% opacity — screenshots can be traced back to this attempt

## The palette (right sidebar, collapsible strip on mobile)

| Tile | Meaning | Color |
|---|---|---|
| Current question | where you are | solid primary |
| Answered | has a saved answer | primary tint |
| Skipped | you skipped (or moved past unanswered — see below) | amber |
| Unanswered | never touched | muted gray |
| Not yet served | question exists in the count but hasn't arrived (adaptive delivery) | dimmed, unclickable |

Sidebar header: **Questions** + `answered/total` + a live **progress bar**; legend with **Answered / Skipped / Unanswered** counts. *(Mobile: a collapsible "Questions" bar on top with the same tiles.)*

## Navigation & answer controls (bottom bar)
| Button | What it does |
|---|---|
| **Previous** | moves back (disabled at question1) — revisiting and re-choosing overwrites the saved answer |
| **Clear** (eraser) | empties the selection **on screen** — ⚠ **A15:** no event is sent, so the answer already saved server-side stays until you click a different choice. *After Clear, always pick a new option if you want the grade to change.* |
| **Skip** | records a skip (amber), clears any local answer, advances |
| **Next** | advances — **if the current question has no answer, this also records it as skipped** |
| **Submit** | appears only on the **last** question, and only once the gate below is met |

## Auto-save, recovery & connection
- **Every choice click** emits an `answer` socket event (`testId, questionIndex, questionId, answer, timeTaken`) — there is no separate Save button
- Your progress is mirrored to `localStorage` (`test_state_{id}`) as you go: a refresh or crash restores position, answers and skips. The copy is deleted on submit/cancel
- Leaving mid-test triggers the browser's *"leave site?"* warning (`beforeunload`)
- The socket **rejoins automatically on reconnect** (the join flag resets whenever the connection drops)
- **Heartbeat policy:** the server checks every30s — **60 seconds without a heartbeat ⇒ the session is marked `abandoned`** and your socket is disconnected (disconnects also bump `disconnect_count` and persist your last question index)

### Socket events used here
| You → server | Server → you | Purpose |
|---|---|---|
| `join_test {testId}` | `test_joined` | enter room `test:{testId}`; heartbeat starts with your current index |
| `answer {…}` | `answer_recorded` (may carry a **`nextQuestion`** — adaptive extras append to your list) | auto-save |
| `skip {…}` | — | record skip / request next question |
| `heartbeat {testId, questionIndex?}` | `time_update` | liveness + timer sync |
| `submit_test {testId}` | `test_submitted` (may carry `reason:"timeout"`) | finish |
| — | `error {message}` | shown on the error card / banner |

Handshake uses a5-minute **socket ticket** from `POST /api/user/socket-ticket` (never the HTTP access token) — background in [Ch4](ch04-sessions-security-permissions.md), full contract in Appendix C.

## The countdown
Computed from the server's **`ends_at`** (not a local guess): ticks every second, red at ≤60s, and **at `00:00` the test submits itself** — the server confirms with `test_submitted` (`reason:"timeout"`) and the results screen appears.

## Submitting
**Gate:** the Submit button stays disabled until
```
answered ≥ min(35, ⌈0.95 × totalQuestions⌉)
```
Hovering shows *"For submission minimum of {n} required"*. Examples:

| Total | You must have answered |
|--:|--:|
|10 |10 |
|20 |19 |
|40 |35 |
|45 |35 |
|100 |35 |

1. **Submit** → modal **"Submit Test?"** with live counts — **Answered / Skipped / Unanswered** — and **Go Back** / **Submit Test**
2. Confirm → heartbeat stops, `submit_test` fires, the local recovery copy is cleared
3. The **results screen replaces the room in place**: ✓ *"Test Completed!"* / *"Great job finishing the test"*, a big score circle (**≥70 emerald · ≥50 amber · below red**), **Correct / Incorrect / Total** tiles, then **View Test History** → [Ch8](ch08-my-tests.md). The full review lives at `/test-result?id=` ([Ch13](ch13-results-analytics.md)).

<!-- img: ch11-submit-confirm -->

## Cancelling (abandoning)
Header **Cancel** → modal:
- Title: **"Cancel Test?"**
- Text: *"Are you sure you want to cancel this test? Your progress will be lost and the test will be marked as abandoned."*
- **Continue Test** / **Cancel Test** (destructive)

Confirm → `POST /api/test/abandon/{id}` → local recovery copy cleared → heartbeat stops → `/dashboard/my-tests`, where the row now reads **Abandoned**. If the abandon call fails you stay in the room with the error shown — nothing is lost.

<!-- img: ch11-cancel-confirm -->

> **Pre-assessment exception (A13):** the Cancel button doesn't exist on pre-assessment tests — finish it or let the clock submit it ([Ch9](ch09-available-tests-pre-assessment.md)).

## When things go wrong
| You see | Because | Fix |
|---|---|---|
| Dot turns **red** | socket dropped | wait — it rejoins automatically; keep answering (localStorage has your progress) |
| Long offline (>60s) | server heartbeat policy | the attempt may have been marked **abandoned** — check My Tests |
| Submit disabled + tooltip | below the answer threshold | answer more questions (formula above) |
| "…already been completed" error card | attempt already finished | open it from My Tests → **View** (Ch13) |
| Spinner *"Loading next question…"* | an adaptive question is being served | wait; persistent → check backend/Redis (Ch5) |
| Timer red | ≤60s left | submit if the gate allows — otherwise it auto-submits at zero |
| Browser "leave site?" prompt | beforeunload guard | **Stay** — leaving may trigger the heartbeat/abandon rules |
| Cleared answer still graded | A15 — Clear is local-only | click a different choice to overwrite the saved answer |

## Roles & permissions
The route group only requires a signed-in session (`RouteGuard requireAuth` — no role filter); the **data** is student-scoped: a mismatched account gets the error card, not the questions. Pre-assessment tests add the stricter no-cancel rule (A13). Model: [Ch4](ch04-sessions-security-permissions.md).

## Related
- **Chapters:** [Ch8 (start/resume)](ch08-my-tests.md) · [Ch9 (predefined & gate)](ch09-available-tests-pre-assessment.md) · [Ch10 (join links)](ch10-joining-a-test.md) · [Ch12 — Time-Based Tests](ch12-time-based-tests.md) · [Ch13 — Results](ch13-results-analytics.md) · [Ch4 — Sessions/Sockets](ch04-sessions-security-permissions.md)
- **Screens:** P27 · **Anomalies:** A13, A15 · **Appendices:** C (socket contract) · E · F
