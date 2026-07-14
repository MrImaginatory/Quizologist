# Content Service API Documentation

Base URL: `http://localhost:3002/api/content`

---

## Course

### POST /course

Create a new course.

**Body:**
```json
{
  "name": "Computer Science",
  "description": "Course of Computer Science and Engineering"
}
```

| Field       | Type   | Required | Rules                           |
|-------------|--------|----------|---------------------------------|
| name        | string | Yes      | 1-100 characters                |
| description | string | No       | Optional                        |

**201 Created:**
```json
{
  "success": true,
  "message": "Course created successfully",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "computer science",
    "description": "Course of Computer Science and Engineering"
  }
}
```

**409 Conflict:**
```json
{
  "success": false,
  "message": "Course with this name already exists",
  "data": null
}
```

---

### GET /course

Get all courses with pagination.

**Query Params:** `page` (default 1), `limit` (default 10, max 100)

**200 OK:**
```json
{
  "success": true,
  "message": "Courses retrieved successfully",
  "data": {
    "courses": [
      {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "name": "computer science",
        "description": "Course of Computer Science and Engineering"
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

---

### GET /course/:id

Get a single course by UUID.

**200 OK:**
```json
{
  "success": true,
  "message": "Course retrieved successfully",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "computer science",
    "description": "Course of Computer Science and Engineering"
  }
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Course not found",
  "data": null
}
```

---

### PUT /course/:id

Update a course.

**Body:**
```json
{
  "name": "Computer Science & Engineering",
  "description": "Updated description"
}
```

**200 OK:**
```json
{
  "success": true,
  "message": "Course updated successfully",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "computer science & engineering",
    "description": "Updated description"
  }
}
```

---

### DELETE /course/:id

Soft delete a course.

**200 OK:**
```json
{
  "success": true,
  "message": "Course deleted successfully",
  "data": {
    "message": "Course deleted successfully"
  }
}
```

---

## Subject

### POST /subject

Create a new subject under a course.

**Body:**
```json
{
  "name": "Data Structures",
  "description": "Study of data structures and algorithms",
  "course_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

| Field       | Type   | Required | Rules                    |
|-------------|--------|----------|--------------------------|
| name        | string | Yes      | 1-100 characters         |
| description | string | No       | Optional                 |
| course_id   | string | Yes      | Valid UUID               |

**201 Created:**
```json
{
  "success": true,
  "message": "Subject created successfully",
  "data": {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "name": "data structures",
    "description": "Study of data structures and algorithms",
    "course_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }
}
```

---

### GET /subject

Get all subjects with pagination.

**Query Params:** `page`, `limit`

**200 OK:**
```json
{
  "success": true,
  "message": "Subjects retrieved successfully",
  "data": {
    "subjects": [
      {
        "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        "name": "data structures",
        "description": "Study of data structures and algorithms",
        "course_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "course": {
          "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          "name": "computer science"
        }
      }
    ],
    "pagination": {
      "total": 15,
      "page": 1,
      "limit": 10,
      "totalPages": 2
    }
  }
}
```

---

### GET /subject/course/:courseId

Get all subjects under a specific course.

**Query Params:** `page`, `limit`

**200 OK:**
```json
{
  "success": true,
  "message": "Subjects retrieved successfully",
  "data": {
    "subjects": [
      {
        "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        "name": "data structures",
        "description": "Study of data structures and algorithms",
        "course_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "course": {
          "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          "name": "computer science"
        }
      }
    ],
    "pagination": {
      "total": 8,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

---

### GET /subject/:id

Get a single subject by UUID.

**200 OK:**
```json
{
  "success": true,
  "message": "Subject retrieved successfully",
  "data": {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "name": "data structures",
    "description": "Study of data structures and algorithms",
    "course_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "course": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "name": "computer science"
    }
  }
}
```

---

### PUT /subject/:id

Update a subject.

**Body:**
```json
{
  "name": "Advanced Data Structures",
  "course_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

**200 OK:**
```json
{
  "success": true,
  "message": "Subject updated successfully",
  "data": {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "name": "advanced data structures",
    "description": "Study of data structures and algorithms",
    "course_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }
}
```

---

### DELETE /subject/:id

Soft delete a subject.

**200 OK:**
```json
{
  "success": true,
  "message": "Subject deleted successfully",
  "data": {
    "message": "Subject deleted successfully"
  }
}
```

---

## Topic

### POST /topic

Create a new topic under a subject.

**Body:**
```json
{
  "name": "Binary Trees",
  "description": "Introduction to binary tree data structure",
  "subject_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901"
}
```

| Field       | Type   | Required | Rules                    |
|-------------|--------|----------|--------------------------|
| name        | string | Yes      | 1-100 characters         |
| description | string | No       | Optional                 |
| subject_id  | string | Yes      | Valid UUID               |

**201 Created:**
```json
{
  "success": true,
  "message": "Topic created successfully",
  "data": {
    "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "name": "binary trees",
    "description": "Introduction to binary tree data structure",
    "subject_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901"
  }
}
```

---

### GET /topic

Get all topics with pagination.

**Query Params:** `page`, `limit`

**200 OK:**
```json
{
  "success": true,
  "message": "Topics retrieved successfully",
  "data": {
    "topics": [
      {
        "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
        "name": "binary trees",
        "description": "Introduction to binary tree data structure",
        "subject_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        "subject": {
          "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
          "name": "data structures",
          "course": {
            "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
            "name": "computer science"
          }
        }
      }
    ],
    "pagination": {
      "total": 30,
      "page": 1,
      "limit": 10,
      "totalPages": 3
    }
  }
}
```

---

### GET /topic/subject/:subjectId

Get all topics under a specific subject.

**Query Params:** `page`, `limit`

**200 OK:**
```json
{
  "success": true,
  "message": "Topics retrieved successfully",
  "data": {
    "topics": [
      {
        "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
        "name": "binary trees",
        "description": "Introduction to binary tree data structure",
        "subject_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        "subject": {
          "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
          "name": "data structures",
          "course": {
            "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
            "name": "computer science"
          }
        }
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

---

### GET /topic/:id

Get a single topic by UUID.

**200 OK:**
```json
{
  "success": true,
  "message": "Topic retrieved successfully",
  "data": {
    "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "name": "binary trees",
    "description": "Introduction to binary tree data structure",
    "subject_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "subject": {
      "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "name": "data structures",
      "course": {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "name": "computer science"
      }
    }
  }
}
```

---

### PUT /topic/:id

Update a topic.

**Body:**
```json
{
  "name": "Red-Black Trees",
  "subject_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901"
}
```

**200 OK:**
```json
{
  "success": true,
  "message": "Topic updated successfully",
  "data": {
    "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "name": "red-black trees",
    "description": "Introduction to binary tree data structure",
    "subject_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901"
  }
}
```

---

### DELETE /topic/:id

Soft delete a topic.

**200 OK:**
```json
{
  "success": true,
  "message": "Topic deleted successfully",
  "data": {
    "message": "Topic deleted successfully"
  }
}
```
