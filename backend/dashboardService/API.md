# Dashboard Service API Documentation

Base URL: `http://localhost:3007/api/dashboard`

> In production, all requests should go through the API Gateway at `http://localhost:3000/api/dashboard`.

---

## GET /stats

Get dashboard statistics based on user role. **All authenticated users.**

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

**200 OK (Admin):**
```json
{
  "success": true,
  "message": "Dashboard stats retrieved successfully",
  "data": {
    "role": "admin",
    "testsSubmitted": 1248,
    "totalQuestions": 3542,
    "totalTopics": 486,
    "topicsCovered": 312,
    "studentsCount": 892,
    "totalSubjects": 19,
    "totalTeachers": 11
  }
}
```

**200 OK (Teacher):**
```json
{
  "success": true,
  "message": "Dashboard stats retrieved successfully",
  "data": {
    "role": "teacher",
    "questionsAdded": 156,
    "studentsInFaculties": 234,
    "testsSubmitted": 567,
    "questionsInFaculties": 892
  }
}
```

**200 OK (Student):**
```json
{
  "success": true,
  "message": "Dashboard stats retrieved successfully",
  "data": {
    "role": "student",
    "questionsInEnrolledFaculties": 450,
    "testsSubmitted": 12
  }
}
```

---

## Error Responses

| Status | Message |
|--------|---------|
| 400 | Invalid role |
| 401 | Token is required |
| 403 | You do not have permission to perform this action |
| 500 | Internal server error |
