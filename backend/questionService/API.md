# Question Service API Documentation

Base URL: `http://localhost:3003/api/question`

> In production, all requests should go through the API Gateway at `http://localhost:3000/api/question`.

---

## POST / — Create Question

Create a new question. The `questionAddedBy` field is auto-populated from the `x-user-id` header.

**Headers:**
```
Content-Type: application/json
x-user-id: <uuid>
```

**Body (MCQ):**
```json
{
  "type": "mcq",
  "question": "What is the time complexity of binary search?",
  "choices": ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
  "correctAnswer": "O(log n)",
  "explanation": "Binary search halves the search space each step.",
  "videoUrl": "https://youtube.com/watch?v=example",
  "difficulty": "normal",
  "topic_id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "subject_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "course_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| type | string | Yes | `"mcq"` or `"descriptive"` |
| question | string | Yes | Non-empty. Must be unique per topic. |
| choices | string[] | MCQ only | 2-5 items. Not allowed for descriptive. |
| correctAnswer | string | Yes | Must match one of the choices (MCQ) |
| explanation | string | No | — |
| videoUrl | string | No | Valid URL |
| difficulty | string | No | `"beginner"`, `"normal"` (default), `"mid"`, `"hard"`, `"expert"` |
| topic_id | string | Yes | UUID — must reference an existing, non-deleted topic |
| subject_id | string | Yes | UUID — must reference an existing, non-deleted subject |
| course_id | string | Yes | UUID — must reference an existing, non-deleted course |

**201 Created:**
```json
{
  "success": true,
  "message": "Question created successfully",
  "data": {
    "id": "d4e5f6a7-b8c9-0123-def4-567890abcdef",
    "type": "mcq",
    "question": "What is the time complexity of binary search?",
    "choices": ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
    "correctAnswer": "O(log n)",
    "explanation": "Binary search halves the search space each step.",
    "videoUrl": "https://youtube.com/watch?v=example",
    "difficulty": "normal",
    "topic_id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "subject_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "course_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "questionAddedBy": "14312853-91cc-473b-9516-5265e7d6f4c7"
  }
}
```

**409 Conflict — Duplicate question:**
```json
{
  "success": false,
  "message": "A question with this text already exists for this topic",
  "data": null
}
```

---

## GET / — Get All Questions

Get all questions with pagination.

**Query Params:**

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| page | number | No | 1 | Page number |
| limit | number | No | 10 | Items per page (max 100) |

**200 OK:**
```json
{
  "success": true,
  "message": "Questions retrieved successfully",
  "data": {
    "questions": [
      {
        "id": "d4e5f6a7-...",
        "type": "mcq",
        "question": "What is the time complexity of binary search?",
        "choices": ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
        "correctAnswer": "O(log n)",
        "explanation": "Binary search halves the search space each step.",
        "videoUrl": "https://youtube.com/watch?v=example",
        "difficulty": "normal",
        "topic_id": "c3d4e5f6-...",
        "subject_id": "b2c3d4e5-...",
        "course_id": "a1b2c3d4-...",
        "questionAddedBy": "14312853-..."
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

---

## GET /search — Search Questions

Search questions by text (case-insensitive).

**Query Params:**

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| q | string | Yes | — | Search query |
| page | number | No | 1 | Page number |
| limit | number | No | 10 | Items per page |

**Example:** `GET /api/question/search?q=binary&page=1&limit=10`

**200 OK:** Same structure as GET /

---

## GET /filter — Filter Questions

Filter questions by course, subject, and/or topic.

**Query Params:**

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| course_id | string | No | — | Filter by course UUID |
| subject_id | string | No | — | Filter by subject UUID |
| topic_id | string | No | — | Filter by topic UUID |
| page | number | No | 1 | Page number |
| limit | number | No | 10 | Items per page |

**Example:** `GET /api/question/filter?course_id=abc-123&subject_id=def-456&page=1&limit=20`

**200 OK:** Same structure as GET /

---

## GET /topic/:topicId — Get Questions by Topic

Get all questions under a specific topic.

**Path Params:** `topicId` — UUID of the topic

**Query Params:** `page`, `limit`

**200 OK:** Same structure as GET /

---

## GET /import-template — Download Import Template

Download an Excel template with pre-filled course/subject/topic names.

**Response:** Binary Excel file (`.xlsx`)

**Headers:**
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename=question_import_template.xlsx
```

**Template columns:**
```
Course Name | Subject Name | Topic Name | Question | Option 1 | Option 2 | Option 3 | Option 4 | Option 5 | Correct Answer | Explanation | Video URL | Question Added By
```

---

## POST /bulk — Bulk Import Questions

Import multiple questions from an array. Each question is validated independently — valid ones are inserted, invalid ones are skipped with error reasons.

**Headers:**
```
Content-Type: application/json
x-user-id: <uuid>
```

**Body:**
```json
{
  "questions": [
    {
      "type": "mcq",
      "question": "What is binary search?",
      "choices": ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
      "correctAnswer": "O(log n)",
      "explanation": "Halves search space each step.",
      "videoUrl": "https://youtube.com/watch?v=example",
      "topic_id": "uuid",
      "subject_id": "uuid",
      "course_id": "uuid",
      "questionAddedBy": "uuid"
    }
  ]
}
```

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| questions | array | Yes | 1-500 items |
| questions[].type | string | Yes | Must be `"mcq"` |
| questions[].question | string | Yes | Non-empty |
| questions[].choices | string[] | Yes | 2-5 non-empty strings |
| questions[].correctAnswer | string | Yes | Must match one of the choices |
| questions[].explanation | string | No | — |
| questions[].videoUrl | string | No | Valid URL |
| questions[].topic_id | string | Yes | UUID |
| questions[].subject_id | string | Yes | UUID |
| questions[].course_id | string | Yes | UUID |
| questions[].questionAddedBy | string | No | UUID — defaults to requesting user if omitted |

**200 OK:**
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

---

## GET /:id — Get Question by ID

Get a single question by UUID.

**200 OK:**
```json
{
  "success": true,
  "message": "Question retrieved successfully",
  "data": {
    "id": "d4e5f6a7-...",
    "type": "mcq",
    "question": "What is the time complexity of binary search?",
    "choices": ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
    "correctAnswer": "O(log n)",
    "explanation": "...",
    "videoUrl": "...",
    "difficulty": "normal",
    "topic_id": "...",
    "subject_id": "...",
    "course_id": "...",
    "questionAddedBy": "..."
  }
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Question not found",
  "data": null
}
```

---

## PUT /:id — Update Question

Update a question. Send only the fields to change.

**Body (partial update):**
```json
{
  "question": "Updated question text",
  "difficulty": "hard",
  "choices": ["A", "B", "C", "D"],
  "correctAnswer": "B"
}
```

**200 OK:** Returns the updated question object.

**409 Conflict — Duplicate question text:**
```json
{
  "success": false,
  "message": "A question with this text already exists for this topic",
  "data": null
}
```

---

## DELETE /:id — Delete Question

Soft delete a question.

**200 OK:**
```json
{
  "success": true,
  "message": "Question deleted successfully",
  "data": {
    "message": "Question deleted successfully"
  }
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Question not found",
  "data": null
}
```

---

## Validation Rules

| Rule | Description |
|------|-------------|
| FK must exist | `topic_id`, `subject_id`, `course_id` must reference active records |
| Unique question | Same question text cannot repeat within the same topic |
| MCQ choices | 2-5 choices required, `correctAnswer` must match one |
| Descriptive | No `choices` field allowed |
| Difficulty | One of `beginner`, `normal`, `mid`, `hard`, `expert` (default: `normal`) |
| Bulk max | 500 questions per import |

---

## Error Responses

| Status | Message |
|--------|---------|
| 400 | Topic not found or has been deleted |
| 400 | Subject not found or has been deleted |
| 400 | Course not found or has been deleted |
| 400 | MCQ must have 2-5 choices |
| 400 | Correct answer must match one of the choices |
| 404 | Question not found |
| 409 | A question with this text already exists for this topic |
| 500 | Internal server error |
