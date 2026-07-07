# Question Service API Documentation

Base URL: `http://localhost:3003/api/question`

> In production, all requests should go through the API Gateway at `http://localhost:3000/api/question`.

---

## POST /

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
  "faculty_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

**Body (Descriptive):**
```json
{
  "type": "descriptive",
  "question": "Explain the working of a binary search tree.",
  "correctAnswer": "A BST is a binary tree where left child < parent < right child.",
  "explanation": "BST allows efficient lookup, insertion, and deletion.",
  "difficulty": "mid",
  "topic_id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "subject_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "faculty_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
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
| faculty_id | string | Yes | UUID — must reference an existing, non-deleted faculty |

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
    "faculty_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "questionAddedBy": "14312853-91cc-473b-9516-5265e7d6f4c7"
  }
}
```

**400 Bad Request — FK not found:**
```json
{
  "success": false,
  "message": "Topic not found or has been deleted",
  "data": null
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

## GET /

Get all questions with pagination.

**Query Params:** `page` (default 1), `limit` (default 10, max 100)

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
        "faculty_id": "a1b2c3d4-...",
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

## GET /search?q=

Search questions by text (case-insensitive PostgreSQL ILIKE).

**Query Params:** `q` (required), `page`, `limit`

**Example:** `GET /api/question/search?q=binary&page=1&limit=10`

**200 OK:** Same structure as GET /

---

## GET /topic/:topicId

Get all questions under a specific topic.

**Query Params:** `page`, `limit`

**200 OK:** Same structure as GET /

---

## GET /:id

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
    "explanation": "Binary search halves the search space each step.",
    "videoUrl": "https://youtube.com/watch?v=example",
    "difficulty": "normal",
    "topic_id": "c3d4e5f6-...",
    "subject_id": "b2c3d4e5-...",
    "faculty_id": "a1b2c3d4-...",
    "questionAddedBy": "14312853-..."
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

## PUT /:id

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

**200 OK:**
```json
{
  "success": true,
  "message": "Question updated successfully",
  "data": {
    "id": "d4e5f6a7-...",
    "type": "mcq",
    "question": "Updated question text",
    "choices": ["A", "B", "C", "D"],
    "correctAnswer": "B",
    "difficulty": "hard",
    "explanation": "...",
    "topic_id": "...",
    "subject_id": "...",
    "faculty_id": "...",
    "questionAddedBy": "..."
  }
}
```

**400 Bad Request — FK validation:**
```json
{
  "success": false,
  "message": "Subject not found or has been deleted",
  "data": null
}
```

**409 Conflict — Duplicate question text:**
```json
{
  "success": false,
  "message": "A question with this text already exists for this topic",
  "data": null
}
```

---

## DELETE /:id

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

## Validation Rules Summary

| Rule | Description |
|------|-------------|
| FK must exist | `topic_id`, `subject_id`, `faculty_id` must reference active (non-deleted) records |
| Unique question | Same question text cannot be repeated within the same topic |
| MCQ choices | 2-5 choices required, `correctAnswer` must match one of them |
| Descriptive | No `choices` field allowed |
| Difficulty | One of `beginner`, `normal`, `mid`, `hard`, `expert` (default: `normal`) |

---

## Error Responses

| Status | Message |
|--------|---------|
| 400 | Topic not found or has been deleted |
| 400 | Subject not found or has been deleted |
| 400 | Faculty not found or has been deleted |
| 400 | MCQ must have 2-5 choices |
| 400 | Correct answer must match one of the choices |
| 404 | Question not found |
| 409 | A question with this text already exists for this topic |
| 500 | Internal server error |
