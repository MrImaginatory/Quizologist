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
  "mobileNumber": "9876543210",
  "password": "secret123"
}
```

| Field        | Type     | Required | Rules                                        |
|--------------|----------|----------|----------------------------------------------|
| fname        | string   | Yes      | 1-50 characters                              |
| lname        | string   | Yes      | 1-50 characters                              |
| role         | string   | Yes      | `"student"` or `"teacher"`                   |
| email        | string   | Yes      | Valid email format                           |
| mobileNumber | string   | Yes      | 10-15 characters                             |
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
      "mobileNumber": "9876543210",
      "location": null
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
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
      "mobileNumber": "9876543210",
      "location": {
        "id": "b2c3d4e5-...",
        "address_line_1": "123 Main Street",
        "city": "Mumbai",
        "pincode": "400001",
        "state": "Maharashtra",
        "country": "India"
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
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

Get all users with pagination. **Admin only.**

### Request

**Query Parameters:**

| Param | Type   | Required | Default | Description         |
|-------|--------|----------|---------|---------------------|
| page  | number | No       | 1       | Page number         |
| limit | number | No       | 10      | Items per page (max 100) |

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
        "mobileNumber": "9876543210",
        "location": {
          "id": "b2c3d4e5-...",
          "address_line_1": "123 Main Street",
          "city": "Mumbai",
          "pincode": "400001",
          "state": "Maharashtra",
          "country": "India"
        }
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

## GET /role/:role

Get all users filtered by role with pagination. **Admin only.**

### Request

**Path Parameters:**

| Param | Type   | Required | Values               |
|-------|--------|----------|----------------------|
| role  | string | Yes      | `"student"` or `"teacher"` |

**Query Parameters:** `page`, `limit`

### Response

**200 OK** — Same structure as GET /

---

## GET /:id

Get a single user by ID. **Admin only.**

### Request

**Path Parameters:**

| Param | Type   | Required | Description              |
|-------|--------|----------|--------------------------|
| id    | string | Yes      | UUID of the user         |

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
    "mobileNumber": "9876543210",
    "location": {
      "id": "b2c3d4e5-...",
      "address_line_1": "123 Main Street",
      "city": "Mumbai",
      "pincode": "400001",
      "state": "Maharashtra",
      "country": "India"
    }
  }
}
```

**404 Not Found**
```json
{
  "success": false,
  "message": "User not found",
  "data": null
}
```

---

## PATCH /:id/location

Assign or remove a location from a user. **Admin only.**

### Request

**Path Parameters:**

| Param | Type   | Required | Description        |
|-------|--------|----------|--------------------|
| id    | string | Yes      | UUID of the user   |

**Body:**
```json
{
  "location_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901"
}
```

| Field      | Type   | Required | Description |
|------------|--------|----------|-------------|
| location_id | string | Yes (or null) | UUID of location, or `null` to remove |

### Response

**200 OK (assign)**
```json
{
  "success": true,
  "message": "Location assigned to user successfully",
  "data": {
    "id": "a1b2c3d4-...",
    "fname": "john",
    "lname": "doe",
    "role": "student",
    "email": "john@example.com",
    "location": {
      "id": "b2c3d4e5-...",
      "address_line_1": "123 Main Street",
      "city": "Mumbai",
      "pincode": "400001",
      "state": "Maharashtra",
      "country": "India"
    }
  }
}
```

**200 OK (remove)**
```json
{
  "success": true,
  "message": "Location removed from user successfully",
  "data": {
    "id": "a1b2c3d4-...",
    "fname": "john",
    "lname": "doe",
    "role": "student",
    "email": "john@example.com",
    "location": null
  }
}
```

**400 Bad Request** — Cannot assign central location
```json
{
  "success": false,
  "message": "Cannot assign the central location to users",
  "data": null
}
```

**404 Not Found** — User or location not found
```json
{
  "success": false,
  "message": "User not found",
  "data": null
}
```

---

## Location Endpoints (Admin Only)

Base URL: `http://localhost:3001/api/location`

### POST /

Create a new location.

**Body:**
```json
{
  "address_line_1": "123 Main Street",
  "address_line_2": "Suite 100",
  "landmark": "Near City Mall",
  "city": "Mumbai",
  "pincode": "400001",
  "state": "Maharashtra",
  "country": "India"
}
```

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| address_line_1 | string | Yes | 1-255 characters |
| address_line_2 | string | No | 1-255 characters |
| landmark | string | No | 1-255 characters |
| city | string | Yes | 1-100 characters |
| pincode | string | Yes | 1-10 characters |
| state | string | Yes | 1-100 characters |
| country | string | Yes | 1-100 characters (default: "India") |

**201 Created:**
```json
{
  "success": true,
  "message": "Location created successfully",
  "data": {
    "id": "b2c3d4e5-...",
    "address_line_1": "123 Main Street",
    "address_line_2": "Suite 100",
    "landmark": "Near City Mall",
    "city": "Mumbai",
    "pincode": "400001",
    "state": "Maharashtra",
    "country": "India",
    "is_central": false
  }
}
```

---

### GET /

Get all locations with pagination.

**Query Params:** `page` (default 1), `limit` (default 10, max 100)

**200 OK:**
```json
{
  "success": true,
  "message": "Locations retrieved successfully",
  "data": {
    "locations": [
      {
        "id": "b2c3d4e5-...",
        "address_line_1": "123 Main Street",
        "city": "Mumbai",
        "pincode": "400001",
        "state": "Maharashtra",
        "country": "India",
        "is_central": false
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

### GET /:id

Get a single location by UUID.

**200 OK:**
```json
{
  "success": true,
  "message": "Location retrieved successfully",
  "data": {
    "id": "b2c3d4e5-...",
    "address_line_1": "123 Main Street",
    "address_line_2": "Suite 100",
    "landmark": "Near City Mall",
    "city": "Mumbai",
    "pincode": "400001",
    "state": "Maharashtra",
    "country": "India",
    "is_central": false
  }
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Location not found",
  "data": null
}
```

---

### PUT /:id

Update a location. Central location cannot be modified.

**Body:** Any subset of fields from POST /

**200 OK:**
```json
{
  "success": true,
  "message": "Location updated successfully",
  "data": { ... }
}
```

**400 Bad Request** — Central location
```json
{
  "success": false,
  "message": "Cannot modify the central location",
  "data": null
}
```

---

### DELETE /:id

Soft delete a location. Central location cannot be deleted.

**200 OK:**
```json
{
  "success": true,
  "message": "Location deleted successfully",
  "data": {
    "message": "Location deleted successfully"
  }
}
```

**400 Bad Request** — Central location
```json
{
  "success": false,
  "message": "Cannot delete the central location",
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
