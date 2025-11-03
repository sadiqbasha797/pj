# Digital Marketing APIs

Complete documentation for Digital Marketing team member endpoints.

## Base URL
```
/api/digital-marketing
```

## Authentication
All endpoints require JWT authentication using the `verifyMarketingToken` middleware.

---

## Authentication Endpoints

### Register
**POST** `/register`

Creates a new digital marketing account.

**Form Data:**
- `username` (text)
- `email` (text)
- `password` (text)
- `image` (file, optional)
- `skills` (array)

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Digital Marketing Role created successfully",
  "data": {
    "username": "marketer1",
    "email": "marketer@example.com"
  }
}
```

---

### Login
**POST** `/login`

Authenticates a digital marketer.

**Request Body:**
```json
{
  "email": "marketer@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "marketer1",
    "userRole": "digital-marketing"
  }
}
```

---

### Password Reset
**POST** `/forgot-password`

Initiates password reset with OTP.

**Response:** `200 OK`
```json
{
  "message": "OTP has been sent to your email"
}
```

**POST** `/reset-password`

Completes password reset.

---

## Profile Management

### Get Profile
**GET** `/profile`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": { ... }
}
```

---

### Update Profile
**PUT** `/profile`

**Form Data:**
- `username` (text, optional)
- `email` (text, optional)
- `skills` (array, optional)
- `image` (file, optional)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

---

### Delete Profile
**DELETE** `/profile`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Profile deleted successfully"
}
```

---

## Marketing Task Management

### Create Marketing Task
**POST** `/create-marketing-task`

Creates a new marketing task.

**Form Data:**
- `taskName` (text)
- `taskDescription` (text)
- `projectId` (text)
- `startDate` (date)
- `endDate` (date)
- `priority` (text)
- `budget` (number)
- `relatedDocs` (files)
- `media` (files)

**Response:** `201 Created`
```json
{
  "message": "Marketing task and corresponding calendar event created successfully",
  "task": { ... }
}
```

---

### Get All Marketing Tasks
**GET** `/get-all-marketing-tasks`

Lists all marketing tasks.

**Response:** `200 OK`
```json
[
  {
    "_id": "...",
    "taskName": "Task Name",
    "status": "in-progress",
    "budget": 1000,
    "leads": 50
  }
]
```

---

### Get Task by ID
**GET** `/get-marketing-task-by-id/:taskId`

Gets specific task details.

---

### Update Marketing Task
**PUT** `/update-marketing-task/:taskId`

Updates a marketing task.

**Response:** `200 OK`
```json
{
  "message": "Marketing task updated successfully"
}
```

---

### Delete Marketing Task
**DELETE** `/delete-marketing-task/:taskId`

---

### Get Assigned Tasks
**GET** `/assigned-tasks`

Lists tasks assigned to the marketer.

---

## Task Update Management

### Create Task Update
**POST** `/task-updates`

Adds an update to a marketing task.

**Form Data:**
- `taskId` (text)
- `description` (text)
- `startDate` (date)
- `endDate` (date)
- `leadsInfo` (JSON)
- `budget` (number)
- `attachments` (files, up to 5)

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Task update created successfully"
}
```

---

### Get Task Updates
**GET** `/task-updates/:taskId`

Lists updates for a specific task.

**Response:** `200 OK`
```json
[...]
```

---

### Get Project Task Updates
**GET** `/project-task-updates/:projectId`

Lists updates for all tasks in a project.

---

### Update Task Update
**PUT** `/task-updates/:id`

Updates a task update.

---

### Delete Task Update
**DELETE** `/task-updates/:id`

---

### Add Comment
**POST** `/task-updates/:id/comments`

Adds a comment to a task update.

---

## Revenue Management

### Create Revenue
**POST** `/revenue`

Creates a revenue entry.

**Form Data:**
- `projectId` (text, optional)
- `revenueGenerated` (number)
- `description` (text)
- `attachments` (files, up to 5)

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Revenue entry created successfully"
}
```

---

### Get All Revenue
**GET** `/revenue`

Lists all revenue entries.

---

### Get Revenue by Project
**GET** `/revenue/project/:projectId`

---

### Update Revenue
**PUT** `/revenue/:revenueId`

---

### Delete Revenue
**DELETE** `/revenue/:revenueId`

---

## Calendar Management

### Create Event
**POST** `/add-event`

**Response:** `201 Created`
```json
{
  "message": "Event added successfully and emails sent"
}
```

---

### Update Event
**PUT** `/update-event/:eventId`

---

### Delete Event
**DELETE** `/delete-event/:eventId`

---

## Holiday Management

### Apply for Holiday
**POST** `/apply-for-holiday`

Creates a holiday request.

**Request Body:**
```json
{
  "startDate": "2024-02-01T00:00:00.000Z",
  "endDate": "2024-02-05T00:00:00.000Z",
  "reason": "Personal"
}
```

---

### Get Holidays
**GET** `/fetch-holidays`

---

### Withdraw Holiday
**PUT** `/withdraw-holiday/:holidayId`

---

## Notifications

### Get Notifications
**GET** `/notifications`

---

### Mark All as Read
**PUT** `/notifications/mark-all-as-read`

---

## Meeting Management

### Get Participating Meetings
**GET** `/participating-meetings`

---

### Get Marketing Events
**GET** `/marketing-events`

---

## Member Access

### Get Digital Marketing Members
**GET** `/digital-marketing-members`

---

### Get Content Creator Members
**GET** `/content-creator-members`

---

### Get Developers
**GET** `/developers`

---

### Get Managers
**GET** `/managers`

---

### Get Admins
**GET** `/admins`

---

### Get Clients
**GET** `/clients`

---

### Get Projects
**GET** `/projects`

Lists all projects in the system.

---

## Error Responses

All endpoints return standard error responses:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error"
}
```

