# Manager APIs

Complete documentation for Manager-related endpoints.

## Base URL
```
/api/manager
```

## Authentication
All Manager endpoints require JWT authentication using the `verifyManagerToken` middleware.

---

## Authentication Endpoints

### Manager Login
**POST** `/login`

Authenticates a manager and returns a JWT token.

**Request Body:**
```json
{
  "email": "manager@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Manager logged in",
  "token": "jwt_token_here",
  "manager": {
    "_id": "...",
    "username": "manager1",
    "email": "manager@example.com"
  }
}
```

---

### Password Reset - Initiate
**POST** `/forgot-password`

Sends OTP for password reset.

**Request Body:**
```json
{
  "email": "manager@example.com"
}
```

**Response:** `200 OK`
```json
{
  "message": "OTP has been sent to your email",
  "email": "manager@example.com"
}
```

---

### Password Reset - Complete
**POST** `/reset-password`

Resets password using OTP.

**Request Body:**
```json
{
  "email": "manager@example.com",
  "otp": "123456",
  "newPassword": "newpassword123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password reset successful"
}
```

---

## Profile Management

### Get Manager Profile
**GET** `/profile`

Retrieves the authenticated manager's profile.

**Response:** `200 OK`
```json
{
  "_id": "...",
  "username": "manager1",
  "email": "manager@example.com",
  "teamSize": 5,
  "developers": [
    {
      "developerId": "...",
      "developerName": "dev1",
      "assignedOn": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### Update Manager Profile
**PUT** `/profile`

Updates manager profile information.

**Request Body:**
```json
{
  "username": "updated_username",
  "email": "newemail@example.com"
}
```

**Response:** `200 OK`
```json
{
  "message": "Manager profile updated",
  "manager": { ... }
}
```

---

### Update Manager Media
**PUT** `/update-media`

Updates profile image.

**Form Data:**
- `profileImage` (file)

**Response:** `200 OK`
```json
{
  "message": "Media files updated successfully",
  "manager": { ... }
}
```

---

## Developer Management

### Get All Developers
**GET** `/developers`

Lists all developers in the system.

**Response:** `200 OK`
```json
[
  {
    "_id": "...",
    "username": "dev1",
    "email": "dev@example.com",
    "verified": "yes"
  }
]
```

---

### Get Developer by ID
**GET** `/developer/:developerId`

Gets details of a specific developer.

**Response:** `200 OK`
```json
{
  "_id": "...",
  "username": "dev1",
  "email": "dev@example.com",
  "skills": ["JavaScript", "Node.js"]
}
```

---

### Get Non-Verified Developers
**GET** `/non-verified`

Lists all unverified developers.

**Response:** `200 OK`
```json
[
  {
    "_id": "...",
    "username": "pending_dev",
    "verified": "no"
  }
]
```

---

### Verify Developer
**POST** `/verify-dev/:developerId`

Verifies a developer.

**Response:** `200 OK`
```json
{
  "message": "Developer verified successfully",
  "developer": { ... }
}
```

---

### Delete Developer
**DELETE** `/delete-dev/:developerId`

Removes a developer from the team.

**Response:** `200 OK`
```json
{
  "message": "Developer deleted successfully"
}
```

---

## Team Management

### Create Team Request
**POST** `/team-request`

Creates a request to add team members.

**Request Body:**
```json
{
  "requestType": "developer",
  "memberId": "member_id",
  "notes": "Need additional developer"
}
```

**Response:** `201 Created`
```json
{
  "message": "Team member request created successfully",
  "request": { ... }
}
```

---

### Get Manager Requests
**GET** `/team-requests`

Lists all team requests from this manager.

**Response:** `200 OK`
```json
{
  "requests": [
    {
      "_id": "...",
      "requestType": "developer",
      "status": "pending",
      "requestDate": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## Project Management

### Create Project
**POST** `/project`

Creates a new project.

**Form Data:**
- `title` (text)
- `description` (text)
- `deadline` (date)
- `assignedTo` (JSON array)
- `status` (text)
- `relatedDocs` (files, up to 5)

**Response:** `201 Created`
```json
{
  "message": "Project added successfully and event created",
  "project": { ... }
}
```

---

### Get All Projects
**GET** `/projects`

Lists all projects.

**Response:** `200 OK`
```json
[
  {
    "_id": "...",
    "title": "Project Name",
    "status": "in-progress",
    "deadline": "2024-02-01T00:00:00.000Z"
  }
]
```

---

### Get Projects by Status
**GET** `/projects/status`

Filters projects by status.

**Query Parameters:**
- `status` (required): project status

**Response:** `200 OK`
```json
[
  {
    "_id": "...",
    "title": "Project Name",
    "status": "completed"
  }
]
```

---

### Update Project
**PUT** `/project/:projectId`

Updates project details.

**Form Data:**
- `title` (text, optional)
- `description` (text, optional)
- `deadline` (date, optional)
- `relatedDocs` (files, up to 5, optional)

**Response:** `200 OK`
```json
{
  "message": "Project updated successfully",
  "project": { ... }
}
```

---

### Delete Project
**DELETE** `/project/:projectId`

Deletes a project.

**Response:** `200 OK`
```json
{
  "message": "Project deleted successfully"
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
  "title": "Team Meeting",
  "description": "Weekly sync",
  "eventDate": "2024-02-01T10:00:00.000Z",
  "participants": [...],
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

Lists events created by the manager.

**Response:** `200 OK`
```json
[...]
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

### Get All Holidays
**GET** `/holidays`

Lists all holiday requests.

**Response:** `200 OK`
```json
[
  {
    "_id": "...",
    "developer": "dev_id",
    "startDate": "2024-02-01T00:00:00.000Z",
    "endDate": "2024-02-05T00:00:00.000Z",
    "status": "pending"
  }
]
```

---

### Approve/Deny Holiday
**PUT** `/holidays/:holidayId`

Approves or denies holiday request.

**Request Body:**
```json
{
  "status": "approved"
}
```

**Response:** `200 OK`
```json
{
  "message": "Holiday request approved",
  "holiday": { ... }
}
```

---

### Update Holiday
**PUT** `/holidays/:holidayId`

Updates holiday details.

**Response:** `200 OK`
```json
{
  "message": "Holiday updated successfully",
  "holiday": { ... }
}
```

---

### Delete Holiday
**DELETE** `/holidays/:holidayId`

Deletes a holiday request.

**Response:** `200 OK`
```json
{
  "message": "Holiday deleted successfully"
}
```

---

### Get Holiday by ID
**GET** `/holiday/:holidayId`

Gets specific holiday details.

**Response:** `200 OK`
```json
{
  "_id": "...",
  "developer": "dev_id",
  "status": "approved",
  "reason": "Personal"
}
```

---

### Get Developer Holidays
**GET** `/developer-holidays`

Lists all holidays for developers.

**Response:** `200 OK`
```json
[...]
```

---

## Task Management

### Create Task
**POST** `/add-task`

Creates a new task.

**Form Data:**
- `taskName` (text)
- `description` (text)
- `projectId` (text)
- `participants` (JSON array)
- `startDate` (date)
- `endDate` (date)
- `status` (text)
- `relatedDocs` (files, up to 5)

**Response:** `201 Created`
```json
{
  "message": "Task and corresponding calendar event added successfully",
  "task": { ... }
}
```

---

### Get All Tasks
**GET** `/tasks`

Lists all tasks.

**Response:** `200 OK`
```json
[...]
```

---

### Get Tasks by Project
**GET** `/project-task/:projectId`

Lists tasks for a specific project.

**Response:** `200 OK`
```json
[
  {
    "_id": "...",
    "taskName": "Task Name",
    "projectId": "project_id",
    "status": "in-progress"
  }
]
```

---

### Get Task by ID
**GET** `/task/:taskId`

Gets specific task details.

**Response:** `200 OK`
```json
{
  "_id": "...",
  "taskName": "Task Name",
  "participants": [...],
  "status": "completed"
}
```

---

### Update Task
**PUT** `/update-task/:taskId`

Updates a task.

**Form Data:**
- `taskName` (text, optional)
- `description` (text, optional)
- `status` (text, optional)
- `relatedDocs` (files, optional)

**Response:** `200 OK`
```json
{
  "message": "Task updated successfully",
  "task": { ... }
}
```

---

### Delete Task
**DELETE** `/delete-task/:taskId`

Deletes a task.

**Response:** `200 OK`
```json
{
  "message": "Task deleted successfully"
}
```

---

### Add Task Update
**POST** `/task/:taskId/update`

Adds update to a task.

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

## Notifications

### Get Notifications
**GET** `/notifications`

Lists manager notifications.

**Response:** `200 OK`
```json
{
  "message": "Notifications fetched successfully",
  "notifications": [...]
}
```

---

### Mark Notification as Read
**PUT** `/notifications/:notificationId/read`

Marks notification as read.

**Response:** `200 OK`
```json
{
  "message": "Notification marked as read"
}
```

---

### Mark All as Read
**PUT** `/notifications/read`

Marks all notifications as read.

**Response:** `200 OK`
```json
{
  "message": "All notifications marked as read"
}
```

---

## Marketing Task Management

All marketing task endpoints are documented in [Marketing Task APIs](marketing-task-apis.md).

---

## Revenue Management

### Create Revenue
**POST** `/revenue`

Creates a revenue entry.

**Request Body:**
```json
{
  "projectId": "project_id",
  "revenueGenerated": 5000,
  "description": "Project completion payment"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Revenue entry created successfully",
  "data": { ... }
}
```

---

### Update Revenue
**PUT** `/revenue/:revenueId`

Updates revenue entry.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Revenue entry updated successfully"
}
```

---

### Delete Revenue
**DELETE** `/revenue/:revenueId`

Deletes revenue entry.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Revenue entry deleted successfully"
}
```

---

## Task Updates & Comments

### Get Task Updates
**GET** `/task-updates/:taskId`

Lists all updates for a task.

**Response:** `200 OK`
```json
[...]
```

---

### Get Project Task Updates
**GET** `/project-task-updates/:projectId`

Lists updates for all tasks in a project.

**Response:** `200 OK`
```json
[...]
```

---

### Add Comment
**POST** `/comment/:updateId`

Adds a comment to a task update.

**Request Body:**
```json
{
  "comment": "Good progress, keep it up!"
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

---

## Member Access

### Get All Admins
**GET** `/admins`

Lists all admins.

**Response:** `200 OK`
```json
[
  {
    "_id": "...",
    "username": "admin1",
    "email": "admin@example.com"
  }
]
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

### Get Digital Marketing Members
**GET** `/digital-marketing-members`

Lists all digital marketing team members.

**Response:** `200 OK`
```json
[...]
```

---

### Get Content Creator Members
**GET** `/content-creator-members`

Lists all content creators.

**Response:** `200 OK`
```json
[...]
```

