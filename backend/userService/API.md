# User Service API Documentation

Base URL: `http://localhost:3001/api/user`

---

## POST /signup

Register a new user. All string fields (except password) are stored in lowercase. If the email belongs to a soft-deleted user, the account is restored.

### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "fname": "John",
  "lname": "Doe",
  "role": "student",
  "email": "john@example.com",
  "mobilenumber": "9876543210",
  "password": "secret123"
}
```

| Field        | Type     | Required | Rules                                        |
|--------------|----------|----------|----------------------------------------------|
| fname        | string   | Yes      | 1-50 characters                              |
| lname        | string   | Yes      | 1-50 characters                              |
| role         | string   | Yes      | `"student"` or `"teacher"`                   |
| email        | string   | Yes      | Valid email format                           |
| mobilenumber | string   | Yes      | 10-15 characters                             |
| password     | string   | Yes      | 6-100 characters                             |

### Response

**201 Created**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "fname": "john",
      "lname": "doe",
      "role": "student",
      "email": "john@example.com",
      "mobilenumber": "9876543210"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**400 Bad Request** — Validation failed
```json
{
  "success": false,
  "message": "Invalid email format, Validation failed",
  "data": null
}
```

**409 Conflict** — Email already exists (active account)
```json
{
  "success": false,
  "message": "User with this email already exists",
  "data": null
}
```

---

## POST /login

Authenticate an existing user and return a JWT token.

### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

| Field    | Type   | Required | Rules            |
|----------|--------|----------|------------------|
| email    | string | Yes      | Valid email format |
| password | string | Yes      | At least 1 character |

### Response

**200 OK**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "fname": "john",
      "lname": "doe",
      "role": "student",
      "email": "john@example.com",
      "mobilenumber": "9876543210"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**400 Bad Request** — Validation failed
```json
{
  "success": false,
  "message": "Validation failed",
  "data": null
}
```

**401 Unauthorized** — Wrong email or password
```json
{
  "success": false,
  "message": "Invalid email or password",
  "data": null
}
```

---

## GET /

Get all users with pagination.

### Request

**Headers:**
```
Content-Type: application/json
```

**Query Parameters:**

| Param | Type   | Required | Default | Description         |
|-------|--------|----------|---------|---------------------|
| page  | number | No       | 1       | Page number         |
| limit | number | No       | 10      | Items per page (max 100) |

**Example:** `GET /api/user?page=1&limit=20`

### Response

**200 OK**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "fname": "john",
        "lname": "doe",
        "role": "student",
        "email": "john@example.com",
        "mobilenumber": "9876543210"
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

**400 Bad Request** — Invalid query parameters
```json
{
  "success": false,
  "message": "Validation failed",
  "data": null
}
```

---

## GET /role/:role

Get all users filtered by role with pagination.

### Request

**Headers:**
```
Content-Type: application/json
```

**Path Parameters:**

| Param | Type   | Required | Values               |
|-------|--------|----------|----------------------|
| role  | string | Yes      | `"student"` or `"teacher"` |

**Query Parameters:**

| Param | Type   | Required | Default | Description         |
|-------|--------|----------|---------|---------------------|
| page  | number | No       | 1       | Page number         |
| limit | number | No       | 10      | Items per page (max 100) |

**Example:** `GET /api/user/role/student?page=1&limit=20`

### Response

**200 OK**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "fname": "john",
        "lname": "doe",
        "role": "student",
        "email": "john@example.com",
        "mobilenumber": "9876543210"
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

**400 Bad Request** — Invalid role or query parameters
```json
{
  "success": false,
  "message": "Validation failed",
  "data": null
}
```

---

## GET /:id

Get a single user by ID.

### Request

**Headers:**
```
Content-Type: application/json
```

**Path Parameters:**

| Param | Type   | Required | Description              |
|-------|--------|----------|--------------------------|
| id    | string | Yes      | UUID of the user         |

**Example:** `GET /api/user/a1b2c3d4-e5f6-7890-abcd-ef1234567890`

### Response

**200 OK**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "fname": "john",
    "lname": "doe",
    "role": "student",
    "email": "john@example.com",
    "mobilenumber": "9876543210"
  }
}
```

**400 Bad Request** — Invalid UUID format
```json
{
  "success": false,
  "message": "Validation failed",
  "data": null
}
```

**404 Not Found** — User does not exist
```json
{
  "success": false,
  "message": "User not found",
  "data": null
}
```

---

## JWT Token

The token returned from both endpoints is a standard JWT with the following payload:

```json
{
  "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "email": "john@example.com",
  "role": "student",
  "iat": 1751808000,
  "exp": 1752412800
}
```

Use it in subsequent requests as a Bearer token:
```
Authorization: Bearer <token>
```

Token expiry: 7 days (configurable via `JWT_EXPIRES_IN` in `.env`).
