# Chapter12 — Time-Based Tests

> **Part:** IV — Taking Tests · **Phase:**6
> **Covers:** P28 `/tb-live-test`, `tb:*` socket events, how the mode differs from the standard room
> **Roles:** built for students (same route-group guard as Ch11)

## In this chapter
- How a time-based test is started (the Time-Based pill from [Ch8](ch08-my-tests.md))
- Questions served **one at a time** — Save & Next, locked history
- The countdown, timeout submission and the "all correct" ending
- Leaving mid-test: *not* an abandon — it stays resumable
- A side-by-side comparison with the standard room (Ch11)

## Getting here
- **From:** My Tests → **Start Test** → D10 → **Time-Based** pill → duration → *Test Selections* → **Start Test**: `POST /api/test/time-based/start` → toast **"Time-Based Test started successfully!"** → **`/tb-live-test?id={session}`**
- First paint: *"Loading test…"* spinner until the socket delivers your **first question**

## How this mode works
Unlike a standard test (your questions arrive with the session), the backend **serves questions one at a time**:

1. `tb:join` → `tb:test_joined` — room `tb_test:{id}`, your starting `timeRemaining`
2. Read the question, pick a choice (local only — nothing sent yet)
3. **Save & Next** → `tb:answer {testId, questionId, answer, timeTaken}` → record locally + *"Loading next question…"* → the server replies **`tb:next_question`** and the question slides in (auto-advance), or…
   - **Skip** → `tb:skip` → next question (amber in the palette)
4. Repeat until the **clock hits zero** (auto `tb:submit`) or you clear the bank (below)

**Locked history:** every question you've already served-and-answered is **final** — you can revisit it from the palette for review, but its choices are dimmed and unclickable (your submitted answer stays displayed). Only the newest question is "live".

**Between questions** the bottom bar shows a disabled **"Loading…"** placeholder so the layout doesn't shift; **Previous**/**Next** browse your served questions freely.

<!-- img: ch12-time-based-live -->

## The room, briefly
Everything familiar from [Ch11](ch11-live-test-room.md) — connection dot, theme toggle, red-at-60s timer, palette with Answered/Skipped/Unanswered legend, watermark — with these substitutions:

| Element | This room |
|---|---|
| Header badge | **TIME-BASED** (mono) instead of the `test_id` |
| Watermark | tiled **"TIME-BASED"** text instead of your `test_id` |
| Sidebar header | `… answered` count (no progress bar — the total grows as questions arrive) |
| Clear button | **doesn't exist** — change an answer only on the live question by picking another choice |
| Cancel | always present (even on pre-assessment-flavored sessions) |

## Ending the test
**1 — The clock runs out.** At `00:00` the client submits automatically; the confirmation arrives as `tb:test_submitted` (`reason:"timeout"`) with toast **"Time's up! Your test has been submitted."** → results screen: *"Test Completed!"* / *"Great job finishing the time-based test"* + score circle + **Correct / Incorrect / Total** tiles + **View Test History** → [Ch8](ch08-my-tests.md).

**2 — You clear the bank.** Answer everything correctly and `tb:all_correct` triggers a full-screen banner:

> **You're unstoppable!**
> You have correctly answered every question in the bank. Submit the test to see your final score.
> **[Submit Test]**

which opens the familiar **"Submit Test?"** modal (Answered / Skipped / Unanswered counts → **Go Back** / **Submit Test**).

<!-- img: ch12-all-correct-banner -->

> **Note:** apart from that all-correct banner, **there is no manual Submit button in this mode** — by design, the timer (or finishing the bank) is what ends a time-based test.

**3 — Leaving early.** Header **Cancel** → modal: *"Are you sure you want to leave? Your session stays active and you can resume from My Tests."* → **Continue Test** / **Cancel Test**. Confirming only stops the heartbeat and returns to `/dashboard/my-tests` — **no abandon call**: the attempt remains **In Progress** and **Resume** re-enters it (the clock's `timeRemaining` comes back from the server on rejoin).

## Socket events (`tb:*`)
| You → server | Server → you | Purpose |
|---|---|---|
| `tb:join {testId}` | `tb:test_joined {timeRemaining}` | enter `tb_test:{id}`, start heartbeat + timer |
| `tb:answer {testId, questionId, answer, timeTaken}` | `tb:next_question` · `tb:all_correct` | commit answer, receive next (or bank-cleared) |
| `tb:skip {testId, questionId, timeTaken}` | `tb:next_question` | skip forward |
| `tb:heartbeat {testId}` | `tb:time_update {timeRemaining}` | liveness + timer sync |
| `tb:submit {testId}` | `tb:test_submitted` (may be `reason:"timeout"`) | finish |
| — | `error {message}` | toast + error card |

Same ticket handshake and heartbeat policy as Ch11 (60s silent ⇒ abandoned) — [Ch4](ch04-sessions-security-permissions.md) / Appendix C.

## Standard vs time-based at a glance

| | Standard (Ch11) | Time-based (this chapter) |
|---|---|---|
| Route | `/live-test?id=` | `/tb-live-test?id=` |
| Started by | D10 **Standard**, predefined tests, join links | D10 **Time-Based** (duration + selections) |
| Question delivery | first batch with the session; adaptive extras appended | strictly **one at a time** |
| Saving an answer | on click | **Save & Next** only (live question) |
| Past questions | re-editable | **locked** (review only) |
| Clear | yes (local-only, A15) | not offered |
| Manual submit | last question + answer threshold | only via the all-correct banner; otherwise timeout |
| Refresh recovery | `localStorage` copy | none — but rejoin resumes (server keeps state) |
| Cancel button | abandons via API | **leaves only** — stays resumable |
| Watermark / badge | your `test_id` | `TIME-BASED` |
| Timeout feedback | silent → results screen | info toast *"Time's up!…"* |

## When things go wrong
| You see | Because | Fix |
|---|---|---|
| Stuck on *"Loading test…"* | first question not served yet | wait; long stall → backend/socket health (Ch5) |
| *"Loading next question…"* won't clear | server didn't answer `tb:answer`/`tb:skip` | wait, then check backend; the error toast/card shows the server's message |
| Error card on open | stale/finished session id | back to **My Tests** and start/resume properly |
| No Submit button anywhere | by design (see Note above) | let the clock finish it, or clear the bank for early submit |
| Attempt is **In Progress** after Cancel | leaving ≠ abandoning | resume it from My Tests — the remaining time is preserved |
| Choices dimmed/unclickable | you're viewing an already-served (locked) question | use **Next/Previous** to the live one |
| *"Time's up! Your test has been submitted."* | timeout auto-submit | review via My Tests → **View** ([Ch13](ch13-results-analytics.md)) |

## Roles & permissions
Same as Ch11: signed-in route guard, student-scoped session data server-side; the `tb_test:{id}` room and `tb:*` events are the only channels this mode speaks. [Ch4](ch04-sessions-security-permissions.md).

## Related
- **Chapters:** [Ch8 — D10 Time-Based start](ch08-my-tests.md) · [Ch11 — standard room](ch11-live-test-room.md) · [Ch13 — Results](ch13-results-analytics.md) · [Ch4 — Sockets](ch04-sessions-security-permissions.md) · [Ch6 — Repeated Questions (why tb repeats surface)](ch06-your-dashboard.md)
- **Screens:** P28 · **Appendices:** C (socket contract) · E · F
