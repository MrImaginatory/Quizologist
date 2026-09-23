# Chapter9 — Available Tests & the Pre-Assessment

> **Part:** III — The Student Handbook · **Phase:**5
> **Covers:** P06, pre-assessment flow (A13 precondition), join-link concept (P26 → Ch10)
> **Roles:** student

## In this chapter
- Predefined tests vs. your own (Ch8) — where assigned tests appear
- Status cards, filters, and exactly how a test's status is decided
- Anatomy of a test card and its four button states
- Starting a predefined test
- The mandatory pre-assessment: banner, gate, resume
- Entering via a shared join link

## Getting here
- **From:** sidebar → **Available Tests**, dashboard *Pending Tests → View All*, or straight to `/dashboard/tests/pending`
- **Ends at:** a test room (`/live-test?id=…` → [Ch11](ch11-live-test-room.md))

## Predefined tests vs. your own
Tests that teachers/admins create and assign to you show up here automatically — with fixed duration, question count, difficulty and (optionally) a **schedule window**. They're different from the ad-hoc tests you configure yourself via *My Tests → Start Test* ([Ch8](ch08-my-tests.md)). How tests get built and assigned: admin/teacher side ([Ch19](ch19-designing-managing-tests.md), Ch28).

## The page

<!-- img: ch09-available-tests -->

1. **Pre-assessment banner** if one is pending (figure in [Ch6](ch06-your-dashboard.md))
2. Heading: **"Available Tests"** / *"Tests available for you to take"*
3. **Three clickable stat cards** — clicking one applies that filter:

| Card | Accent | Icon |
|---|---|---|
| **Available** | green | check circle |
| **Upcoming** | blue | clock |
| **Expired** | gray | alert circle |

> **Note:** *Completed* tests are counted internally but there is **no Completed card and no Completed filter option** — completed tests appear only under **All Tests**.

4. **Filter row:** dropdown **All Tests · Available · Upcoming · Expired** + live count *"{n} test(s) found"*

<!-- img: ch09-filter-upcoming -->

5. **Card grid** (1/2/3 columns as the screen narrows), or an empty-state card when nothing matches.

## How status is decided
Checked in this order:

1. You already took it → **Completed** (green)
2. Scheduled, window not open yet → **Upcoming** (blue)
3. Scheduled, `end_time` in the past → **Expired** (gray)
4. Otherwise → **Available** (green)

Times are rendered in **your browser's local time zone**.

## Anatomy of a test card
- **Badges, top-right:** amber **"Pre-Assessment"** (only on the baseline test) and the status badge from the table above
- **Title** + description (clamped to two lines)
- Facts row: ⏱ `{duration} min` · *Questions:* `{n}` · *Difficulty:* badge (capitalized)
- **Scheduled window box** (scheduled tests only): *"📅 Scheduled Test"* + `Start: …` / `End: …` local date-times
- **Button** — label and state follow the status:

| Status | Button | Enabled |
|---|---|:-:|
| Available | **▶ Start Test** | ✓ (unless the pre-assessment gate, below) |
| Upcoming | "Not Started Yet" | ✗ |
| Expired | "Test Expired" | ✗ |
| Completed | "Completed" | ✗ |

While a start request is in flight, the button shows a spinner.

## Starting a predefined test
1. Press **▶ Start Test** on an available card.
2. The server creates your attempt → toast **"Test started!"**
3. You land in `/live-test?id={attempt}` — the standard live room ([Ch11](ch11-live-test-room.md)): timer, palette, submit rules all behave as described there.

Empty states: *"No tests available yet"* (nothing assigned) or *"No {filter} tests"* (that status is empty — switch back to All Tests). Load failure shows a red message card.

## The pre-assessment (A13 precondition)
**What it is:** a baseline test your administrator marks as *required*. Until you complete it, **every other test is locked** — that's the designed precondition (inventory **A13**).

**Where the banner appears:** atop **Dashboard**, **My Tests** and **Available Tests** — for students only, whenever the status endpoint says *required && not completed*:

- Title: **⚠ Mandatory Pre-Assessment Required**
- Text: *"You must complete the pre-assessment before you can take any other tests. This helps us understand your baseline."*
- Button: **→ Start Pre-Assessment Now** — or **→ Resume Pre-Assessment** when you already have a session

**Click behavior:** an existing session is resumed as-is (`/live-test?id={sessionId}`); otherwise a fresh attempt starts and routes to the room. Failures surface as toasts.

**The gate, precisely:**
- On *Available Tests*: while pending, every card's Start button is **disabled** with tooltip *"Complete the pre-assessment first"* — **except** the pre-assessment test itself (its amber badge marks it)
- On *My Tests*: the **Start Test** button is disabled with the same tooltip ([Ch8](ch08-my-tests.md))
- On completion the banner disappears everywhere (next page load), and normal tests unlock

<!-- img: ch06-preassessment-banner -->

## Entering via a shared link (concept)
Tests can also be entered through a shareable URL of the form **`/test/join/<token>`** (screen P26 — the canonical join route). Opening such a link signs you straight into that test's room after login — you don't need to browse to this page at all. Token expiry, account mismatch behavior and the legacy `/join/<token>` variant are covered in [Ch10](ch10-joining-a-test.md).

## When things go wrong
| You see | Because | Fix |
|---|---|---|
| *"No tests available yet"* | nothing assigned (or wrong account) | teacher/admin assigns tests — Ch19/Ch29; check filter first |
| *"No {filter} tests"* | that status is empty | switch to **All Tests** |
| All buttons disabled with tooltip | pre-assessment pending | take the amber-banner test first |
| Buttons read "Not Started Yet" / "Test Expired" / "Completed" | by status design | check the schedule box times |
| Filter shows `0 test(s) found` | filter narrower than your data | reset to All Tests |
| Banner won't disappear | pre-assessment still incomplete | resume it from the banner; completion clears it on reload |
| Schedule times look "off" | shown in your browser's local zone | compare against the notice your admin sent |
| `404 — Page not found` | student-only page | Ch4 role matrix |

## Roles & permissions
**Student-only.** Tests are assigned to your account; predefined starts are recorded per student (attempt history in [Ch8](ch08-my-tests.md)). Join links may also target your account — see [Ch10](ch10-joining-a-test.md) for token rules. Permission model: [Ch4](ch04-sessions-security-permissions.md).

## Related
- **Chapters:** [Ch6 — Dashboard (banner)](ch06-your-dashboard.md) · [Ch8 — My Tests (gate on Start)](ch08-my-tests.md) · [Ch10 — Joining a Test](ch10-joining-a-test.md) · [Ch11 — Live Test Room](ch11-live-test-room.md) · [Ch19](ch19-designing-managing-tests.md) / Ch28 — Tests (admin view)
- **Screens:** P06, P26 (link) · **Anomalies:** A13, A01 (footnote in Ch10) · **Appendices:** C · E · F
