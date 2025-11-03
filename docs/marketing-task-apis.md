# Marketing Task APIs

Complete documentation for Marketing Task management endpoints.

## Base URL
```
/api/admin
/api/manager
/api/digital-marketing
/api/content-creator
```

## Authentication
Marketing task endpoints are available to Admin, Manager, Digital Marketing, and Content Creator roles.

---

## Marketing Task Management

### Create Marketing Task

**POST** `/marketing-task` (Admin/Manager)
**POST** `/create-marketing-task` (Digital Marketing/Content Creator)

Creates a new marketing task.

**Form Data:**
- `taskName` (text, required)
- `taskDescription` (text, required)
- `projectId` (text, optional)
- `assignedTo` (JSON string - array for Admin/Manager)
- `priority` (text, optional)
- `startDate` (date, required)
- `endDate` (date, required)
- `budget` (number, optional)
- `status` (text, optional)
- `relatedDocs` (files, up to 5, optional)
- `media` (files, up to 5, optional)

**AssignedTo Format (Admin/Manager):**
```json
[
  {
    "id": "user_id",
    "role": "DigitalMarketingRole"
  }
]
```

**Response:** `201 Created`
```json
{
  "message": "Marketing task and corresponding calendar event created successfully",
  "task": {
    "_id": "...",
    "taskName": "Social Media Campaign",
    "taskDescription": "Launch Q1 campaign",
    "assignedTo": [...],
    "budget": 5000,
    "leads": 0,
    "status": "in-progress"
  }
}
```

**Automated Actions:**
1. Creates marketing task
2. Creates calendar event
3. Sends notifications to assignees
4. Sends email to assignees (if assigned by Admin/Manager)

---

### Get All Marketing Tasks

**GET** `/marketing-tasks` (Admin/Manager)
**GET** `/get-all-marketing-tasks` (Digital Marketing/Content Creator)

Lists all marketing tasks.

**Response:** `200 OK`
```json
[
  {
    "_id": "...",
    "taskName": "Social Media Campaign",
    "status": "in-progress",
    "budget": 5000,
    "leads": 0,
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-02-01T00:00:00.000Z"
  }
]
```

---

### Get Marketing Tasks by Project

**GET** `/project/:projectId/marketing-tasks`

Lists marketing tasks for a specific project.

**Response:** `200 OK`
```json
[...]
```

---

### Get Task by ID

**GET** `/marketing-task/:taskId` (Admin/Manager)
**GET** `/get-marketing-task-by-id/:taskId` (Digital Marketing/Content Creator)

**Response:** `200 OK`
```json
{
  "_id": "...",
  "taskName": "Social Media Campaign",
  "taskDescription": "...",
  "assignedTo": [...],
  "budget": 5000,
  "leads": 0,
  "relatedDocs": [...]
}
```

---

### Get Assigned Tasks

**GET** `/assigned-tasks` (Digital Marketing/Content Creator)

Lists tasks assigned to the authenticated user.

**Response:** `200 OK`
```json
[...]
```

---

### Update Marketing Task

**PUT** `/marketing-task/:taskId`

Updates task details.

**Form Data:** (All optional)
- `taskName`, `taskDescription`, `priority`, `status`, `budget`
- `assignedTo` (JSON string)
- `relatedDocs` (files, up to 5)
- `media` (files, up to 5)

**Response:** `200 OK`
```json
{
  "message": "Marketing task updated successfully",
  "task": { ... }
}
```

---

### Update Leads Count

**PUT** `/marketing-task/:taskId/leads`

Updates the leads count for a task.

**Request Body:**
```json
{
  "leads": 50
}
```

**Response:** `200 OK`
```json
{
  "message": "Leads count updated successfully"
}
```

---

### Delete Marketing Task

**DELETE** `/marketing-task/:taskId` (Admin/Manager)
**DELETE** `/delete-marketing-task/:taskId` (Digital Marketing/Content Creator)

**Response:** `200 OK`
```json
{
  "message": "Marketing task deleted successfully"
}
```

---

### Get Tasks by User

**GET** `/marketing-user-task/:userId`

Lists all tasks assigned to a specific user.

**Response:** `200 OK`
```json
[...]
```

---

## Task Update Management

Marketing tasks support detailed updates with leads tracking and attachments.

### Create Task Update

**POST** `/task-updates` (Digital Marketing/Content Creator)

Adds progress update to a marketing task.

**Form Data:**
- `taskId` (text, required)
- `description` (text, required)
- `startDate` (date, required)
- `endDate` (date, required)
- `leadsInfo` (JSON string - array of lead objects)
- `budget` (number, optional)
- `attachments` (files, up to 5, optional)

**LeadsInfo Format:**
```json
[
  {
    "name": "Company Name",
    "contact": "contact@company.com",
    "description": "Potential client"
  }
]
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Task update created successfully",
  "data": { ... }
}
```

**Automated Actions:**
1. Creates task update
2. Adds leads to task
3. Sends email to creator and assignees
4. Creates notifications

---

### Get Task Updates

**GET** `/task-updates/:taskId`

Retrieves all updates for a task.

**Response:** `200 OK`
```json
[
  {
    "_id": "...",
    "description": "Campaign launched",
    "leadsInfo": [
      {
        "name": "Company A",
        "contact": "contact@company.com"
      }
    ],
    "attachments": ["url1"],
    "updatedBy": {
      "name": "marketer1"
    },
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
]
```

---

### Get Project Task Updates

**GET** `/project-task-updates/:projectId`

Lists updates for all marketing tasks in a project.

**Response:** `200 OK`
```json
[...]
```

---

### Update Task Update

**PUT** `/task-updates/:id`

Updates an existing task update.

**Form Data:**
- `description`, `leadsInfo`, `budget`
- `attachments` (files, up to 5)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Task update updated successfully"
}
```

---

### Delete Task Update

**DELETE** `/task-updates/:id`

Removes a task update.

**Response:** `200 OK`
```json
{
  "message": "Task update deleted successfully"
}
```

---

### Add Comment

**POST** `/task-updates/:id/comments`

Adds a comment to a task update.

**Request Body:**
```json
{
  "comment": "Good progress!"
}
```

**Response:** `201 Created`
```json
{
  "message": "Comment added successfully"
}
```

---

## Notifications

Marketing task operations trigger:
1. Notifications to assignees
2. Email notifications with task details
3. Update notifications with leads info

---

## Error Handling

**404 Not Found:**
```json
{
  "message": "Marketing task not found"
}
```

**403 Forbidden:**
```json
{
  "message": "You are not assigned to this task"
}
```

**400 Bad Request:**
```json
{
  "message": "Invalid assignedTo format"
}
```

