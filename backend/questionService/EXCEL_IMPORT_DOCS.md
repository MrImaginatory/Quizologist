# Excel Import Questions — Frontend Integration Guide

## Overview

The Excel import feature lets admins and teachers bulk-upload MCQ questions via an Excel file. The flow is:

1. **Download template** → backend generates an `.xlsx` with pre-filled course/subject/topic names
2. **User fills the Excel** → adds questions, options, correct answer, etc.
3. **Frontend parses the Excel** → reads rows client-side
4. **Frontend resolves names to UUIDs** → looks up course/subject/topic/user by name
5. **Frontend shows preview** → user reviews all questions before saving
6. **User clicks Save** → frontend sends the array to `POST /api/question/bulk`
7. **Backend validates + inserts** → returns a report of what was imported vs failed

---

## Step 1: Download Template

### Request

```
GET /api/question/import-template
Authorization: Bearer <token>
```

### Response

Binary `.xlsx` file. Set `responseType: 'blob'` or `responseType: 'arraybuffer'` in your HTTP client.

### Template Structure

| Column | Description |
|--------|-------------|
| Course Name | Pre-filled with all courses from DB |
| Subject Name | Pre-filled with all subjects from DB |
| Topic Name | Pre-filled with all topics from DB |
| Question | Empty — user fills this |
| Option 1 | Empty — user fills this |
| Option 2 | Empty — user fills this |
| Option 3 | Empty — optional |
| Option 4 | Empty — optional |
| Option 5 | Empty — optional |
| Correct Answer | Must match one of the options exactly |
| Explanation | Empty — optional |
| Video URL | Empty — optional |
| Question Added By | Empty — optional (teacher name or email) |

The first 3 data rows contain sample combinations so the user sees valid course→subject→topic mappings.

### Example Code

```typescript
const downloadTemplate = async () => {
  const response = await fetch('/api/question/import-template', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'question_import_template.xlsx';
  a.click();
  window.URL.revokeObjectURL(url);
};
```

---

## Step 2: Parse Excel (Client-Side)

Use a library like `xlsx` (SheetJS) or `exceljs` to parse the uploaded file.

### Recommended: xlsx (SheetJS)

```bash
npm install xlsx
```

```typescript
import * as XLSX from 'xlsx';

interface ParsedQuestion {
  courseName: string;
  subjectName: string;
  topicName: string;
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  option5: string;
  correctAnswer: string;
  explanation: string;
  videoUrl: string;
  questionAddedBy: string;
}

const parseExcel = (file: File): Promise<ParsedQuestion[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // Convert to JSON — headers become keys
      const raw = XLSX.utils.sheet_to_json(sheet);

      const questions: ParsedQuestion[] = raw.map((row: any) => ({
        courseName: row['Course Name'] || '',
        subjectName: row['Subject Name'] || '',
        topicName: row['Topic Name'] || '',
        question: row['Question'] || '',
        option1: row['Option 1'] || '',
        option2: row['Option 2'] || '',
        option3: row['Option 3'] || '',
        option4: row['Option 4'] || '',
        option5: row['Option 5'] || '',
        correctAnswer: row['Correct Answer'] || '',
        explanation: row['Explanation'] || '',
        videoUrl: row['Video URL'] || '',
        questionAddedBy: row['Question Added By'] || '',
      }));

      resolve(questions);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};
```

### Key Notes

- Rows with empty `Question` column should be skipped
- Rows that are sample data (pre-filled course/subject/topic only) should be skipped
- The header row is row 1 — start reading from row 2

---

## Step 3: Resolve Names to UUIDs

The Excel uses human-readable names, but the API needs UUIDs. Resolve them using data you already have from the app.

### What You Need to Fetch

```
GET /api/content/course        → courses[]
GET /api/content/subject       → subjects[]
GET /api/content/topic         → topics[]
GET /api/user?role=teacher     → teachers[] (optional, for Question Added By)
```

### Resolution Logic

```typescript
// Build lookup maps (case-insensitive)
const courseMap = new Map(
  courses.map(c => [c.name.toLowerCase(), c.id])
);

const subjectMap = new Map(
  subjects.map(s => [`${s.name.toLowerCase()}|${s.course_id}`, s.id])
);

const topicMap = new Map(
  topics.map(t => [`${t.name.toLowerCase()}|${t.subject_id}`, t.id])
);

// Optional: for resolving "Question Added By" name → user UUID
const userMap = new Map(
  users.map(u => [`${u.fname} ${u.lname}`.toLowerCase(), u.id])
);

// Resolve a parsed row
function resolveRow(row: ParsedQuestion) {
  const courseId = courseMap.get(row.courseName.toLowerCase().trim());
  if (!courseId) return { error: `Course '${row.courseName}' not found` };

  const subjectKey = `${row.subjectName.toLowerCase().trim()}|${courseId}`;
  const subjectId = subjectMap.get(subjectKey);
  if (!subjectId) return { error: `Subject '${row.subjectName}' not found in course '${row.courseName}'` };

  const topicKey = `${row.topicName.toLowerCase().trim()}|${subjectId}`;
  const topicId = topicMap.get(topicKey);
  if (!topicId) return { error: `Topic '${row.topicName}' not found in subject '${row.subjectName}'` };

  // Resolve Question Added By (optional)
  let questionAddedBy: string | undefined;
  if (row.questionAddedBy.trim()) {
    const userId = userMap.get(row.questionAddedBy.toLowerCase().trim());
    if (!userId) return { error: `User '${row.questionAddedBy}' not found` };
    questionAddedBy = userId;
  }

  // Build choices array (only non-empty options)
  const choices = [row.option1, row.option2, row.option3, row.option4, row.option5]
    .filter(opt => opt && opt.trim() !== '');

  return {
    type: 'mcq' as const,
    question: row.question.trim(),
    choices,
    correctAnswer: row.correctAnswer.trim(),
    explanation: row.explanation || undefined,
    videoUrl: row.videoUrl || undefined,
    topic_id: topicId,
    subject_id: subjectId,
    course_id: courseId,
    questionAddedBy,
  };
}
```

### Important: Subject + Topic Uniqueness

A subject name might exist in multiple courses, and a topic name might exist in multiple subjects. Always resolve by **name + parent ID**:

- Subject → key = `subjectName + courseId`
- Topic → key = `topicName + subjectId`

---

## Step 4: Client-Side Validation

Before sending to the API, validate each row on the frontend to catch obvious errors early:

```typescript
function validateRow(row: ParsedQuestion, index: number): string | null {
  const rowNum = index + 2; // +2 because Excel rows are 1-indexed and header is row 1

  if (!row.question.trim()) return `Row ${rowNum}: Question is empty`;

  const choices = [row.option1, row.option2, row.option3, row.option4, row.option5]
    .filter(opt => opt && opt.trim() !== '');

  if (choices.length < 2) return `Row ${rowNum}: At least 2 options required`;

  if (!choices.includes(row.correctAnswer.trim())) {
    return `Row ${rowNum}: Correct answer doesn't match any option`;
  }

  if (!row.courseName.trim()) return `Row ${rowNum}: Course name is empty`;
  if (!row.subjectName.trim()) return `Row ${rowNum}: Subject name is empty`;
  if (!row.topicName.trim()) return `Row ${rowNum}: Topic name is empty`;

  return null; // valid
}
```

---

## Step 5: Show Preview to User

After parsing and resolving, display a table/card view of all questions. Group by status:

| Status | Meaning |
|--------|---------|
| Ready | All fields resolved, valid |
| Warning | Some optional fields missing (e.g., no explanation) |
| Error | Resolution failed (course/subject/topic not found, etc.) |

Let the user:
- Review each question
- Edit inline if needed
- Remove questions they don't want
- See a summary: "X ready, Y errors"

---

## Step 6: Bulk Create API Call

When the user clicks "Save", send the resolved questions array.

### Request

```
POST /api/question/bulk
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "questions": [
    {
      "type": "mcq",
      "question": "What is the time complexity of binary search?",
      "choices": ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
      "correctAnswer": "O(log n)",
      "explanation": "Binary search halves the search space each step.",
      "videoUrl": "https://youtube.com/watch?v=example",
      "topic_id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
      "subject_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "course_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "questionAddedBy": "14312853-91cc-473b-9516-5265e7d6f4c7"
    }
  ]
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| questions | array | Yes | 1-500 items |
| questions[].type | string | Yes | Always `"mcq"` for Excel import |
| questions[].question | string | Yes | Non-empty |
| questions[].choices | string[] | Yes | 2-5 non-empty strings |
| questions[].correctAnswer | string | Yes | Must exactly match one of the choices |
| questions[].explanation | string | No | Optional |
| questions[].videoUrl | string | No | Optional, valid URL |
| questions[].topic_id | string | Yes | UUID (resolved from Topic Name) |
| questions[].subject_id | string | Yes | UUID (resolved from Subject Name) |
| questions[].course_id | string | Yes | UUID (resolved from Course Name) |
| questions[].questionAddedBy | string | No | UUID — if omitted, backend uses the requesting user's ID |

### Response

```json
{
  "success": true,
  "message": "Import complete: 47 imported, 3 failed",
  "data": {
    "totalRows": 50,
    "imported": 47,
    "failed": 3,
    "errors": [
      { "row": 5, "reason": "A question with this text already exists for this topic" },
      { "row": 12, "reason": "Correct answer does not match any provided option" },
      { "row": 31, "reason": "At least 2 valid options are required" }
    ]
  }
}
```

The `row` number corresponds to the Excel row (row 2 = first data row).

### Backend Validation Per Row

The backend validates each question independently:

| Check | Error Message |
|-------|--------------|
| Choices < 2 | "At least 2 valid options are required" |
| Correct answer not in choices | "Correct answer does not match any provided option" |
| Duplicate question in same topic | "A question with this text already exists for this topic" |
| DB insert failure | The Sequelize error message |

---

## Step 7: Show Result to User

After the API call, display:
- Success count
- Failure count with row numbers and reasons
- Link to view the imported questions

---

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│  1. User clicks "Import from Excel"                 │
│     → GET /api/question/import-template             │
│     → Download .xlsx file                           │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│  2. User fills Excel, uploads back to browser       │
│     → Parse .xlsx client-side (xlsx / exceljs)      │
│     → Skip header row, skip empty rows              │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│  3. Frontend resolves names → UUIDs                 │
│     → Fetch courses, subjects, topics, users        │
│     → Build lookup maps                             │
│     → Match by name (+ parent ID for subjects/topics)│
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│  4. Client-side validation                          │
│     → Check question not empty                      │
│     → Check at least 2 options                      │
│     → Check correct answer matches an option        │
│     → Mark rows as Ready / Error                    │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│  5. Show preview table to user                      │
│     → Group by Ready / Error                        │
│     → User can edit or remove rows                  │
│     → Shows summary: X ready, Y errors              │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│  6. User clicks "Save"                              │
│     → POST /api/question/bulk                       │
│     → Send only Ready questions (with UUIDs)        │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│  7. Backend validates + inserts                     │
│     → Returns { imported, failed, errors }          │
│     → Show result to user                           │
└─────────────────────────────────────────────────────┘
```

---

## Example: Full Import Flow

```typescript
import * as XLSX from 'xlsx';

async function handleExcelImport(file: File, token: string) {
  // 1. Parse Excel
  const rows = await parseExcel(file);

  // 2. Fetch lookup data
  const [coursesRes, subjectsRes, topicsRes] = await Promise.all([
    fetch('/api/content/course', { headers: { Authorization: `Bearer ${token}` } }),
    fetch('/api/content/subject', { headers: { Authorization: `Bearer ${token}` } }),
    fetch('/api/content/topic', { headers: { Authorization: `Bearer ${token}` } }),
  ]);

  const courses = (await coursesRes.json()).data.courses;
  const subjects = (await subjectsRes.json()).data.subjects;
  const topics = (await topicsRes.json()).data.topics;

  // 3. Build maps
  const courseMap = new Map(courses.map((c: any) => [c.name.toLowerCase(), c.id]));
  const subjectMap = new Map(subjects.map((s: any) => [`${s.name.toLowerCase()}|${s.course_id}`, s.id]));
  const topicMap = new Map(topics.map((t: any) => [`${t.name.toLowerCase()}|${t.subject_id}`, t.id]));

  // 4. Resolve each row
  const resolved: any[] = [];
  const errors: { row: number; reason: string }[] = [];

  rows.forEach((row, i) => {
    if (!row.question.trim()) return; // skip empty

    const result = resolveRow(row);
    if ('error' in result) {
      errors.push({ row: i + 2, reason: result.error });
    } else {
      resolved.push(result);
    }
  });

  // 5. Show preview (save 'resolved' and 'errors' to state)
  setPreviewData(resolved);
  setValidationErrors(errors);

  // ... user reviews and clicks Save ...

  // 6. Send to API
  const response = await fetch('/api/question/bulk', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ questions: resolved }),
  });

  const result = await response.json();
  // result.data = { totalRows, imported, failed, errors }
}
```

---

## Edge Cases to Handle

| Case | How to Handle |
|------|--------------|
| Empty rows in Excel | Skip rows where `Question` column is empty |
| Duplicate questions | Backend catches this — show in error report |
| Same subject name in different courses | Resolution uses `subjectName + courseId` as key |
| Same topic name in different subjects | Resolution uses `topicName + subjectId` as key |
| Question Added By left empty | Backend defaults to the requesting user's UUID |
| Invalid Question Added By name | Frontend validation catches this before sending |
| More than 5 options filled | Only use first 5 non-empty options |
| Correct Answer is "Option 1" text vs actual option text | Must match the actual option text, not the label |
