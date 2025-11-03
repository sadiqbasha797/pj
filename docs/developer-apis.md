# Developer APIs

Complete documentation for Developer-related endpoints.

## Base URL
```
/api/developer
```

## Authentication
All Developer endpoints require JWT authentication using the `verifyDeveloperToken` middleware.

---

## Authentication Endpoints

### Developer Login
**POST** `/login`

Authenticates a developer and returns a JWT token.

**Request Body:**
```json
{
  "email": "dev@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Developer logged in",
  "token": "jwt_token_here",
  "developer": { ... },
  "manager": {
    "id": "manager_id",
    "username": "manager1",
    "email": "manager@example.com"
  }
}
```

---

### Initiate Password Reset
**POST** `/initiate-password-reset`

Sends OTP for password reset.

**Request Body:**
```json
{
  "email": "dev@example.com"
}
```

---

### Reset Password
**POST** `/reset-password`

Resets password using OTP.

**Request Body:**
```json
{
  "email": "dev@example.com",
  "otp": "123456",
  "newPassword": "newpassword123"
}
```

---

## Profile Management

### Get Developer Profile
**GET** `/profile`

Retrieves the authenticated developer's profile with manager information.

**Response:** `200 OK`
```json
{
  "developer": {
    "_id": "...",
    "username": "dev1",
    "email": "dev@example.com",
    "skills": ["JavaScript", "Node.js"]
  },
  "manager": {
    "_id": "...",
    "username": "manager1",
    "email": "manager@example.com"
  }
}
```

---

### Update Developer Profile
**PUT** `/profile`

Updates developer profile.

**Form Data:**
- `username` (text, optional)
- `email` (text, optional)
- `skills` (array, optional)
- `image` (file, optional)
- `resume` (file, optional)

**Response:** `200 OK`
```json
{
  "message": "Developer profile updated successfully",
  "developer": { ... }
}
```

---

## Project Management

### Get Assigned Projects
**GET** `/projects`

Lists all projects assigned to the developer.

**Response:** `200 OK`
```json
[
  {
    "_id": "...",
    "title": "Project Name",
    "description": "Project description",
    "status": "in-progress",
    "deadline": "2024-02-01T00:00:00.000Z"
  }
]
```

---

### Update Project Status
**PUT** `/project-status/:projectId`

Updates project status.

**Request Body:**
```json
{
  "status": "completed"
}
```

**Response:** `200 OK`
```json
{
  "message": "Project status updated successfully",
  "project": { ... }
}
```

---

## Task Management

### Get Assigned Tasks
**GET** `/tasks`

Lists all tasks assigned to the developer.

**Response:** `200 OK`
```json
[
  {
    "_id": "...",
    "taskName": "Task Name",
    "projectId": "project_id",
    "status": "in-progress",
    "startDate": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### Add Task Update
**POST** `/task/:taskId/update`

Adds an update to an assigned task.

**Form Data:**
- `media` (files, up to 5)

**Response:** `201 Created`
```json
{
  "message": "Task update added successfully",
  "update": { ... }
}
```

---

### Add Final Result
**POST** `/task/:taskId/final-result`

Adds final result to a task.

**Form Data:**
- `resultImages` (files, up to 5)

**Response:** `201 Created`
```json
{
  "message": "Final result added successfully"
}
```

---

### Delete Task Update
**DELETE** `/task/:taskId/update/:updateId`

Deletes a task update.

**Response:** `200 OK`
```json
{
  "message": "Task update deleted successfully"
}
```

---

## Calendar Management

### Create Event
**POST** `/events`

Creates a calendar event.

**Request Body:**
```json
{
  "title": "Team Standup",
  "description": "Daily standup meeting",
  "eventDate": "2024-02-01T10:00:00.000Z",
  "participants": [...],
  "eventType": "Meeting"
}
```

**Response:** `201 Created`
```json
{
  "message": "Event added successfully",
  "event": { ... }
}
```

---

### Get All Events
**GET** `/events`

Lists all calendar events.

**Response:** `200 OK`
```json
[...]
```

---

### Get User Events
**GET** `/user-events`

Lists events created by the developer.

**Response:** `200 OK`
```json
[...]
```

---

### Get Developer Events
**GET** `/developer-events`

Lists events where the developer is a participant or creator.

**Response:** `200 OK`
```json
[
  {
    "_id": "...",
    "title": "Event Name",
    "byMe": true
  }
]
```

---

### Update Event
**PUT** `/events/:eventId`

Updates an event.

**Response:** `200 OK`
```json
{
  "message": "Event updated successfully",
  "event": { ... }
}
```

---

### Delete Event
**DELETE** `/events/:eventId`

Deletes an event.

**Response:** `200 OK`
```json
{
  "message": "Event deleted successfully"
}
```

---

## Holiday Management

### Apply for Holiday
**POST** `/holidays`

Creates a holiday request.

**Request Body:**
```json
{
  "startDate": "2024-02-01T00:00:00.000Z",
  "endDate": "2024-02-05T00:00:00.000Z",
  "reason": "Personal"
}
```

**Response:** `201 Created`
```json
{
  "message": "Holiday request and calendar event submitted successfully",
  "holiday": { ... }
}
```

---

### Get Holidays
**GET** `/holidays`

Lists all holiday requests for the developer.

**Response:** `200 OK`
```json
[
  {
    "_id": "...",
    "startDate": "2024-02-01T00:00:00.000Z",
    "endDate": "2024-02-05T00:00:00.000Z",
    "reason": "Personal",
    "status": "pending"
  }
]
```

---

### Withdraw Holiday
**PUT** `/holidays/withdraw/:holidayId`

Withdraws a holiday request.

**Response:** `200 OK`
```json
{
  "message": "Holiday withdrawn successfully",
  "holiday": { ... }
}
```

---

## Notifications

### Get Notifications
**GET** `/developer-notifications`

Lists notifications for the developer.

**Response:** `200 OK`
```json
[
  {
    "_id": "...",
    "content": "New project assigned: Project Name",
    "type": "Project",
    "read": false,
    "date": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### Mark Notification as Read
**PUT** `/notifications/:notificationId/read`

Marks a notification as read.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

### Mark All as Read
**PUT** `/notifications/mark-all-read`

Marks all notifications as read.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

## Member Access

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

### Get All Admins
**GET** `/admins`

Lists all admins.

**Response:** `200 OK`
```json
[...]
```

---

### Get Digital Marketing Members
**GET** `/digital-marketing-members`

Lists digital marketing team members.

**Response:** `200 OK`
```json
[...]
```

---

### Get Content Creator Members
**GET** `/content-creator-members`

Lists content creators.

**Response:** `200 OK`
```json
[...]
```

---

### Get All Clients
**GET** `/clients`

Lists all clients.

**Response:** `200 OK`
```json
[...]
```

