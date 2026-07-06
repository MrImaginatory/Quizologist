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
      "mobilenumber": "9876543210",
      "createdAt": "2026-07-06T12:00:00.000Z",
      "updatedAt": "2026-07-06T12:00:00.000Z"
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
      "mobilenumber": "9876543210",
      "createdAt": "2026-07-06T12:00:00.000Z",
      "updatedAt": "2026-07-06T12:00:00.000Z"
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
