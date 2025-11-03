# Content Creator APIs

Complete documentation for Content Creator endpoints. Most endpoints are identical to Digital Marketing APIs.

## Base URL
```
/api/content-creator
```

## Authentication
All endpoints require JWT authentication using `verifyContentCreatorToken` middleware.

---

## Authentication Endpoints

### Register
**POST** `/register`

**Form Data:**
- `username`, `email`, `password`
- `image` (file, optional)
- `skills` (array)

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Content Creator account created successfully"
}
```

---

### Login
**POST** `/login`

---

### Password Reset
**POST** `/forgot-password`
**POST** `/reset-password`

---

## Profile Management

### Get Profile
**GET** `/profile`

---

### Update Profile
**PUT** `/profile`

**Form Data:**
- `username`, `email`, `skills`, `image`

---

### Delete Profile
**DELETE** `/profile`

---

## Marketing Task Management

Same as Digital Marketing APIs.

---

## Task Update Management

Same as Digital Marketing APIs.

---

## Revenue Management

Same as Digital Marketing APIs.

---

## Calendar & Holiday Management

Same as Digital Marketing APIs.

---

## Notifications

Same as Digital Marketing APIs.

---

## Member & Project Access

- Get digital marketing members
- Get content creator members
- Get developers, managers, admins
- Get clients and projects

All endpoints follow the same patterns as Digital Marketing APIs.

