# Client APIs

Complete documentation for Client-related endpoints.

## Base URL
```
/api/client
```

## Authentication
Most Client endpoints require JWT authentication using the `verifyClientToken` middleware. Registration and login are public.

---

## Authentication Endpoints

### Register Client
**POST** `/register`

Creates a new client account.

**Form Data:**
- `clientName` (text)
- `email` (text)
- `password` (text)
- `companyName` (text)
- `address` (text)
- `countryCode` (text)
- `mobileNumber` (text)
- `companyLogo` (file, optional)

**Response:** `201 Created`
```json
{
  "message": "Client registered successfully",
  "client": {
    "_id": "...",
    "clientName": "Client Name",
    "email": "client@example.com"
  }
}
```

---

### Client Login
**POST** `/login`

Authenticates a client and returns a JWT token.

**Request Body:**
```json
{
  "email": "client@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "userId": "client_id"
}
```

---

## Profile Management

### Get Client Profile
**GET** `/profile`

Retrieves the authenticated client's profile with projects.

**Response:** `200 OK`
```json
{
  "success": true,
  "client": {
    "_id": "...",
    "clientName": "Client Name",
    "email": "client@example.com",
    "companyName": "Company Name",
    "projects": [...]
  }
}
```

---

### Update Client
**PUT** `/:clientId`

Updates client information.

**Form Data:**
- `clientName` (text, optional)
- `email` (text, optional)
- `companyName` (text, optional)
- `companyLogo` (file, optional)

**Response:** `200 OK`
```json
{
  "message": "Client updated successfully",
  "client": { ... }
}
```

---

### Delete Client
**DELETE** `/:clientId`

Deletes the client account.

**Response:** `200 OK`
```json
{
  "message": "Client deleted successfully"
}
```

---

## Project Management

### Get Client Projects
**GET** `/projects`

Retrieves all projects associated with the client.

**Response:** `200 OK`
```json
{
  "success": true,
  "projects": [
    {
      "_id": "...",
      "title": "Project Name",
      "description": "Project description",
      "status": "in-progress",
      "deadline": "2024-02-01T00:00:00.000Z",
      "tasks": [
        {
          "taskName": "Task Name",
          "status": "completed"
        }
      ]
    }
  ]
}
```

---

## Calendar & Meetings

### Get Client Meetings
**GET** `/meetings`

Retrieves all meetings for the client.

**Response:** `200 OK`
```json
{
  "success": true,
  "meetings": [
    {
      "_id": "...",
      "title": "Project Review",
      "eventDate": "2024-02-01T10:00:00.000Z",
      "location": "Conference Room A",
      "creator": {
        "name": "Manager Name",
        "role": "Manager"
      },
      "participants": [...]
    }
  ]
}
```

---

### Create Event
**POST** `/calendar/event`

Creates a calendar event.

**Request Body:**
```json
{
  "title": "Meeting with Client",
  "description": "Quarterly review",
  "eventDate": "2024-02-01T10:00:00.000Z",
  "participants": [
    {
      "participantId": "user_id",
      "onModel": "Developer"
    }
  ],
  "eventType": "Meeting",
  "location": "Conference Room A"
}
```

**Response:** `201 Created`
```json
{
  "message": "Event added successfully and emails sent",
  "event": { ... }
}
```

---

### Update Event
**PUT** `/calendar/event/:eventId`

Updates a calendar event.

**Response:** `200 OK`
```json
{
  "message": "Event updated successfully",
  "event": { ... }
}
```

---

### Delete Event
**DELETE** `/calendar/event/:eventId`

Deletes a calendar event.

**Response:** `200 OK`
```json
{
  "message": "Event deleted successfully"
}
```

---

## Team Member Access

### Get All Admins
**GET** `/admins`

Lists all admins.

**Response:** `200 OK`
```json
[...]
```

---

### Get All Managers
**GET** `/managers`

Lists all managers.

**Response:** `200 OK`
```json
[...]
```

---

### Get All Developers
**GET** `/developers`

Lists all developers.

**Response:** `200 OK`
```json
[...]
```

---

### Get Digital Marketing Members
**GET** `/digital-marketing`

Lists digital marketing team members.

**Response:** `200 OK`
```json
[...]
```

---

### Get Content Creators
**GET** `/content-creators`

Lists content creators.

**Response:** `200 OK`
```json
[...]
```

---

## Notifications

### Get Notifications
**GET** `/notifications`

Retrieves all notifications for the client.

**Response:** `200 OK`
```json
[
  {
    "_id": "...",
    "content": "New project assigned",
    "type": "Project",
    "read": false,
    "date": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### Mark All as Read
**PUT** `/notifications/mark-all-as-read`

Marks all client notifications as read.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

## Comments

### Add Comment
**POST** `/comment/:updateId`

Adds a comment to a task update.

**Request Body:**
```json
{
  "comment": "Great progress!"
}
```

**Response:** `201 Created`
```json
{
  "message": "Comment added successfully"
}
```

---

### Delete Comment
**DELETE** `/comment/:updateId/:commentId`

Deletes a comment.

**Response:** `200 OK`
```json
{
  "message": "Comment deleted successfully"
}
```

