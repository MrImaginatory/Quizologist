# Chapter 18 — Importing Questions from Excel

> **Part:** V — The Teacher Handbook · **Phase:** 7
> **Covers:** P10 `/dashboard/questions/import`, **F04 Import wizard (owner)** incl. the admin-only "Create Missing Entities" step
> **Roles:** teacher, admin (one step is admin-only)

## In this chapter
- The4-step wizard: download template → upload → preview → result
- Exactly which Excel columns the parser accepts (and their aliases)
- The admin-only **Missing Entities Detected** interstitial (step 2.5)
- Every row-level error message and what to do about it

## Getting here
- **Menu path:** Questions ▸ Import Excel
- **URL:** `/dashboard/questions/import`
- **Requires:** teacher or admin role

Header: **"Import Questions from Excel"** / *"Bulk import MCQ questions using an Excel file"*.

> **Warning:** this wizard imports **MCQ questions only** (the subtitle says so). Rows containing embedded images are rejected — keep the sheet text-only.

<!-- img: ch18-import-upload -->

## F04 — the template format *(this chapter owns F04)*

**Step 1 — Step 1: Download Template:** *"Download the Excel template with pre-filled course, subject, and topic names."* → **Download Template** fetches `GET /api/question/import-template` (a `.xlsx` pre-filled with existing hierarchy names).

### Template columns (header aliases the parser also accepts)
| # | Column | Aliases accepted | Required | Notes |
|--:|---|---|:-:|---|
| 1 | Course Name | Course, `course_name`, `course` | ✓ | must already exist — or be created at step 2.5 (admin) |
| 2 | Subject Name | Subject, `subject_name`, `subject` | ✓ | must belong to the row's course |
| 3 | Topic Name | Topic, `topic_name`, `topic` | ✓ | must belong to the row's subject |
| 4 | Question | — | ✓ | |
| 5–9 | Option1 … Option5 | `Option 1`, `option1`, `Choice 1`, `Choice1` … | ✓ (≥2) | up to 5 |
| 10 | Correct Answer | Correct, `correct_answer`, `answer` | ✓ | must exactly match one option |
| 11 | Difficulty | `Level`, `level` | — | unknown values fall back to *normal* |
| 12 | Explanation | Note, `note` | — | |
| 13 | Video URL | Video, `video_url`, `video` | — | |
| 14 | Question Added By | `Added By`, `added_by` | — | parsed but **not forwarded** on import (the payload sends an empty string — authorship comes from your account) |

## Step 2 — Step 2: Upload Excel
*"Upload your filled Excel file. We'll parse it and validate the questions."* The drop zone (accepts `.xlsx` / `.xls`) has four states:

| State | What you see |
|---|---|
| idle | upload icon + *"Drag & drop your Excel file"* / *"or **browse** to choose a file"* |
| dragging over | *"Drop your file here"* with a highlighted background |
| processing | spinner + *"Processing file..."* |
| file chosen | green spreadsheet icon, file name + size in KB, *"Click or drop to replace"* |

Parsing happens entirely in the browser; nothing uploads until you press Import in step 3.

<!-- img: ch18-import-missing-entities -->

### Step 2.5 — Missing Entities Detected *(admin only)*
If the sheet references courses/subjects/topics that don't exist **and you are an admin** (`user?.role === "admin"`), an orange card replaces the drop zone:

- **Title:** ⚠ *"Missing Entities Detected"*
- **Description:** *"Some Courses, Subjects, or Topics in the uploaded file do not exist in the system. Would you like to add them before importing the questions?"*
- **Badges:** *"{n} New Course(s)"* (blue, pluralized correctly) · *"{n} New Subject"* (purple — **always singular**, a cosmetic quirk) · *"{n} New Topic"* (pink — also always singular)
- **Preview:** a monospace tree of the missing hierarchy using `├──` / `└──` prefixes
- **Buttons:** **Cancel Import** (back to step 2) · **Create Missing Entities** → `POST /api/content/bulk-hierarchy`, then parsing continues

**Teachers never see this card** — for them the same rows simply become errors (below).

<!-- img: ch18-import-preview -->

## Step 3 — Step 3: Preview & Import
*"Review the parsed questions below. Remove any rows you don't want to import."*

- **Badges:** green *"{n} Ready"* · red *"{n} Errors"* (errors badge hidden at 0)
- **Table columns:** `#` · Course · Subject · Topic · Question (truncate 200px) · Difficulty (same five badge colors as [Ch17](ch17-question-bank.md)) · Status · *(unlabeled trash to drop the row)*
- **Status:** green **Ready** · red **Error** — hover the Error badge for its reason
- **Row errors** (each marks the row un-importable):

| Message | Because |
|---|---|
| `Course 'X' not found` | no such course (teacher — no auto-create) |
| `Subject 'X' not found in course 'Y'` | subject missing under that course |
| `Topic 'X' not found in subject 'Y'` | topic missing under that subject |
| *At least 2 options required* | fewer than two non-empty options |
| *Correct answer doesn't match any option* | the answer text differs from every option |
| *Row contains an image — only text is allowed in the Excel sheet* | the row carries an embedded image |

- Image rows also trigger a toast: `` `N row(s) were skipped because they contain embedded images. Only text is allowed.` `` (in the missing-hierarchy flow the toast reads *"`N row(s) contain embedded images and will be skipped. Only text is allowed."*).
- **Import button:** **Import {n} Questions** — disabled at 0 ready rows. While running, a progress line shows *"Importing questions..."* with `current / total` and a progress bar.
- Ready rows post in **batches of 500** to `POST /api/question/bulk`.

<!-- img: ch18-import-result -->

## Step 4 — Import Complete
- **Three tiles:** big number **Total Rows** · green **Imported** · red **Failed**
- **Errors (if any):** a red **"Show Errors (n)"** / **"Hide Errors (n)"** toggle expands **"Detailed Import Errors:"** — each line reads `Row {n}:` followed by the italicized question text and the reason
- **Buttons:** **Import More** (resets to step 2) · **View Questions** (goes to `/dashboard/questions`)

## Data on this screen
### Preview table
| Column | Meaning | Source |
|---|---|---|
| Course / Subject / Topic | hierarchy names from the sheet (truncated 20 chars with a full-text tooltip) | parsed `.xlsx` |
| Question | question text (truncate 200px + tooltip) | parsed `.xlsx` |
| Difficulty | colored badge, capitalized | parsed (fallback *normal*) |
| Status | **Ready** / **Error** (tooltip = reason) | client-side validation |
| *(trash)* | removes that row from the batch before import | client-side only |

### Result tiles
| Tile | Meaning | Source |
|---|---|---|
| Total Rows | rows parsed from the sheet | client count |
| Imported | rows accepted by the server across all batches | sum of `imported` per batch response |
| Failed | rows rejected server-side | sum of `failed`; details in the error list |

## Roles & permissions
- **Teacher** — full wizard; missing hierarchy becomes row errors (no auto-create).
- **Admin** — same wizard **plus** the step 2.5 **Create Missing Entities** card.
- **Student** — no access.

## When things go wrong
| You see | Because | Fix |
|---|---|---|
| *"Failed to download template"* toast | `GET /api/question/import-template` failed | reload; check backend (:5001) |
| *"Failed to parse Excel"* toast | the file isn't a readable `.xlsx`/`.xls` | re-download the template and save as `.xlsx` |
| All rows red with *Course '…' not found* (as a teacher) | the hierarchy doesn't exist and teachers can't auto-create | ask an admin to run this wizard once (step 2.5), or create the content first (Ch26) |
| Red **Error** badges after import | server rejected those rows in the batch | expand **Show Errors (n)**, fix the listed rows in Excel, **Import More** with only the corrected rows |
| *Imported* lower than *Ready* | a batch partially failed (validation, permissions, duplicate rules) | read the detailed errors — each names its row and reason |
| *"Failed to create missing entities"* toast (admin) | `POST /api/content/bulk-hierarchy` failed | fix names in the sheet (likely duplicates/typos) and re-upload |

## Related
- **Chapters:** [Ch17 — The Question Bank](ch17-question-bank.md) · [Ch19 — Designing & Managing Tests](ch19-designing-managing-tests.md) · [Ch2 — Core Concepts](ch02-core-concepts-domain-model.md) · Ch26 (admin: hierarchy) · Ch27 (admin: question bank)
- **Screens:** P10 · **Forms:** F04 *(owner)*
- **Endpoints:** `GET /api/question/import-template`, `POST /api/content/bulk-hierarchy`, `POST /api/question/bulk` (details: Appendix C)
