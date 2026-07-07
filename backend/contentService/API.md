# Content Service API Documentation

Base URL: `http://localhost:3002/api/content`

---

## Faculty

### POST /faculty

Create a new faculty.

**Body:**
```json
{
  "name": "Computer Science",
  "description": "Faculty of Computer Science and Engineering"
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
  "message": "Faculty created successfully",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "computer science",
    "description": "Faculty of Computer Science and Engineering"
  }
}
```

**409 Conflict:**
```json
{
  "success": false,
  "message": "Faculty with this name already exists",
  "data": null
}
```

---

### GET /faculty

Get all faculties with pagination.

**Query Params:** `page` (default 1), `limit` (default 10, max 100)

**200 OK:**
```json
{
  "success": true,
  "message": "Faculties retrieved successfully",
  "data": {
    "faculties": [
      {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "name": "computer science",
        "description": "Faculty of Computer Science and Engineering"
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

### GET /faculty/:id

Get a single faculty by UUID.

**200 OK:**
```json
{
  "success": true,
  "message": "Faculty retrieved successfully",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "computer science",
    "description": "Faculty of Computer Science and Engineering"
  }
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Faculty not found",
  "data": null
}
```

---

### PUT /faculty/:id

Update a faculty.

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
  "message": "Faculty updated successfully",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "computer science & engineering",
    "description": "Updated description"
  }
}
```

---

### DELETE /faculty/:id

Soft delete a faculty.

**200 OK:**
```json
{
  "success": true,
  "message": "Faculty deleted successfully",
  "data": {
    "message": "Faculty deleted successfully"
  }
}
```

---

## Subject

### POST /subject

Create a new subject under a faculty.

**Body:**
```json
{
  "name": "Data Structures",
  "description": "Study of data structures and algorithms",
  "faculty_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

| Field       | Type   | Required | Rules                    |
|-------------|--------|----------|--------------------------|
| name        | string | Yes      | 1-100 characters         |
| description | string | No       | Optional                 |
| faculty_id  | string | Yes      | Valid UUID               |

**201 Created:**
```json
{
  "success": true,
  "message": "Subject created successfully",
  "data": {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "name": "data structures",
    "description": "Study of data structures and algorithms",
    "faculty_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
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
        "faculty_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "faculty": {
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

### GET /subject/faculty/:facultyId

Get all subjects under a specific faculty.

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
        "faculty_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "faculty": {
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
    "faculty_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "faculty": {
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
  "faculty_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
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
    "faculty_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
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
          "faculty": {
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
          "faculty": {
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
      "faculty": {
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
