# Chapter 17 — The Question Bank

> **Part:** V — The Teacher Handbook · **Phase:** 7
> **Covers:** P09 `/dashboard/questions`, **D05 AddQuestionDialog (owner)**, **D06 EditQuestionDialog (owner)**, filters, delete-with-undo quirk (A11)
> **Roles:** teacher, admin

## In this chapter
- Browsing every question with type, text, difficulty and actions
- Filtering by course → subject → topic → difficulty (cascading)
- Creating a question (**Add Question**) and editing one (**Edit Question**)
- Deleting with the 5-second Undo — and the shared-bucket quirk behind it (A11)

## Getting here
- **Menu path:** Questions ▸ All Questions
- **URL:** `/dashboard/questions`
- **Requires:** teacher or admin role

<!-- img: ch17-question-bank -->

## The page
Header: **"Questions"** / *"Manage all questions in the system"* / **+ Add Question** on the right. Under it sits the filter bar, then a DataTable titled **"Questions"** (paginated, default 10 per page).

### Questions table (P09 owns these columns)
| Column | Meaning | Source |
|---|---|---|
| `#` | row number on the current page | client-side index |
| Type | blue badge **"MCQ"** or green badge **"Descriptive"** | `GET /api/question/filter?…` → `type` |
| Question | the question text, truncated at 300px — hover for the full text tooltip | `question` |
| Difficulty | colored badge, word-capitalized: beginner **green** · normal **blue** · mid **yellow** · hard **orange** · expert **red** | `difficulty` |
| Actions | pencil ✏️ (edit → D06) · red trash 🗑 (delete → D13 confirm + undo) | click handlers |

### Filter bar (`QuestionFilters`)
| Field label | Placeholder | Notes |
|---|---|---|
| Course | *"All Courses"* (*"Loading..."* while loading) | changing it clears subject + topic |
| Subject | *"Select course first"* → *"All Subjects"* | disabled until a course is chosen; changing clears topic |
| Topic | *"Select subject first"* → *"All Topics"* | disabled until a subject is chosen |
| Difficulty | *"All Difficulties"* | options: Beginner / Normal / Mid / Hard / Expert |

Teachers load their **teaching** courses/subjects/topics for these selects; admins load everything (`limit=10000`). Any change resets to page 1 and re-queries with `course_id`, `subject_id`, `topic_id`, `difficulty`.

<!-- img: ch17-question-validation-error -->

## Add Question — D05 field table *(this chapter owns D05)*

Title *"Add Question"* · description *"Create a new question. Fill in the details below."* · submit `POST /api/question` with `type` hard-coded `"mcq"`.

| # | Field | Label | Type | Required | Constraints & options |
|--:|---|---|---|:-:|---|
| 1 | `courseId` | **Course \*** | Select | ✓ | placeholder *"Select course"* (*"Loading..."*); enables Subject |
| 2 | `subjectId` | **Subject \*** | Select | ✓ | placeholder *"Select course first"* → *"Select subject"*; enables Topic |
| 3 | `topicId` | **Topic \*** | Select | ✓ | placeholder *"Select subject first"* → *"Select topic"* |
| 4 | `difficulty` | **Difficulty** | Select | — (default *normal*) | beginner / normal / mid / hard / expert |
| 5 | `question` | **Question \*** | Textarea (3 rows) | ✓ | placeholder *"Enter your question here"*; right-aligned counter `n/1000`, input capped at 1000 chars |
| 6 | `choices` | **Choices \*** | Text inputs + radios | ✓ | starts with options; **Add Choice** button until 5 max; placeholder *"Option {n}"*; ✕ removes an option when more than 2 exist; helper line *"Select the radio button next to the correct answer"*; a radio is disabled while its option text is empty |
| 7 | `correctAnswer` | *(radio)* | radio | ✓ | must equal a non-empty choice |
| 8 | `explanation` | **Explanation** | Textarea (2 rows) | — | placeholder *"Optional explanation for the answer"*; counter `n/2000`, capped at 2000 |
| 9 | `videoUrl` | **Video URL** | url input | — | placeholder *"https://youtube.com/watch?v=..."* |

- **Save gate:** the **Save** button stays disabled unless course + subject + topic + question + correct answer are all present.
- **Footer:** **Cancel** · **Save** (spinner while submitting).
- **Toasts:** `Question created successfully!` / `Failed to create question`.

<!-- img: ch17-question-delete-confirm -->

## Edit Question — D06 field table *(this chapter owns D06)*

Title *"Edit Question"* · description *"Update the question details below. The question text cannot be changed."* · submit `PUT /api/question/{id}` (course/subject/topic/type/authorship are re-sent unchanged from the original).

| # | Field | Label | Type | Required | Constraints & options |
|--:|---|---|---|:-:|---|
| 1 | *(display)* | **Question** | read-only block (muted box) | — | below it: *"Question text cannot be edited"* |
| 2 | `difficulty` | **Difficulty \*** | Select | ✓ | beginner / normal / mid / hard / expert |
| 3a | `choices` + `correctAnswer` | **Choices \*** | radios + inputs *(MCQ only)* | ✓ | identical rules to D05 (max 5, ✕ above 2, helper text) |
| 3b | `correctAnswer` | **Correct Answer \*** | Textarea (2 rows) *(descriptive only)* | ✓ | placeholder *"Enter the correct answer"*; `required` |
| 4 | `explanation` | **Explanation** | Textarea | — | counter `n/2000` |
| 5 | `videoUrl` | **Video URL** | url input | — | same placeholder as D05 |

Course/subject/topic are **not shown** here — the question keeps them automatically. **Update** is disabled while `correctAnswer` is empty; success toast: `Question updated successfully`.

## Deleting with undo
1. Click the row's red trash → **D13** confirm: title *"Delete Question"*, description *"Are you sure you want to delete this question? This action can be undone within 5 seconds."*, confirm **Delete**.
2. The dialog closes and an **info toast** appears: `«first 30 characters of the question» will be deleted` with an **Undo** action.
3. If you press **Undo** within 5 seconds, nothing is deleted. Otherwise `DELETE /api/question/{id}` runs and a green toast confirms `«text» deleted successfully`.

> **Note (inventory A11):** the undo registry tags this flow as `type: "topic"` — the **visible copy is correct**, but the tag is also a console label (`Failed to delete topic:`) and the `localStorage` key that pending deletions are stored under. Pending **question** deletions therefore share the **topic** bucket: if you queue a question delete here, then open the admin Topics screen (Ch26), its mount-flush may try to commit your pending question deletion against the *topic* delete API (and vice versa); a failed flush drops the entry. Practically: finish (or let expire) the undo window before navigating to Topics.

## Roles & permissions
- **Teacher** — full CRUD on this screen; the filter dropdowns list only your teaching content.
- **Admin** — same screen, unfiltered content and full catalog in the filters (their dedicated view is Ch27).
- **Student** — no access to `/dashboard/questions`.

## When things go wrong
| You see | Because | Fix |
|---|---|---|
| **Save** stays gray | a required field is missing (course/subject/topic/question/correct answer) | fill every field marked `*` — radio buttons count as the correct answer |
| *"Question text cannot be edited"* in D06 | by design — the wording is frozen after creation | edit difficulty/answer/explanation instead; recreate the question if the wording is wrong |
| *"Correct answer doesn't match any option"* (import path) / radio can't be picked | the chosen option text is empty or was edited after selection | type the option text first, then click its radio |
| *"Failed to create question"* toast | server rejected the request (missing fields server-side, expired token) | reopen the dialog, recheck fields; re-sign-in if 401 ([Ch5](ch05-getting-started.md)) |
| Red error in the table | `GET /api/question/filter` failed | reload; check the backend (:5001) |
| Pending undo never fires / fires later on the Topics screen | the shared `topic` undo bucket (A11) | stay on this page for the 5 seconds, or press Undo deliberately |

## Related
- **Chapters:** [Ch14 — The Teaching Dashboard](ch14-teaching-dashboard.md) · [Ch18 — Importing Questions from Excel](ch18-importing-questions.md) · [Ch19 — Designing & Managing Tests](ch19-designing-managing-tests.md) · [Ch2 — Core Concepts](ch02-core-concepts-domain-model.md) · Ch26 (admin: hierarchy) · Ch27 (admin: question bank)
- **Screens:** P09 · **Dialogs:** D05 *(owner)*, D06 *(owner)*, D13 (delete/undo)
- **Endpoints:** `GET /api/question/filter`, `POST /api/question`, `PUT /api/question/{id}`, `DELETE /api/question/{id}` (details: Appendix C)
