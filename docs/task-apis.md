# Task Management APIs

Complete documentation for Task management endpoints.

## Base URL
```
/api/admin
/api/manager
```

## Authentication
Task endpoints require authentication for Admin or Manager roles.

---

## Task Management

### Create Task

**POST** `/add-task`

Creates a new task with optional file attachments.

**Form Data:**
- `taskName` (text, required)
- `description` (text, required)
- `projectId` (text, required)
- `participants` (JSON string, required - array of objects)
- `startDate` (date, required)
- `endDate` (date, required)
- `status` (text, optional)
- `relatedDocs` (files, up to 5, optional)

**Participants Format:**
```json
[
  {
    "participantId": "dev_id_1",
    "onModel": "Developer"
  }
]
```

**Response:** `201 Created`
```json
{
  "message": "Task and corresponding calendar event added successfully",
  "task": {
    "_id": "...",
    "taskName": "Implement Authentication",
    "description": "Add JWT authentication",
    "projectId": "project_id",
    "participants": [...],
    "status": "in-progress",
    "relatedDocuments": ["url1", "url2"]
  }
}
```

**Automated Actions:**
1. Creates task document
2. Validates participants are in project
3. Creates calendar event
4. Sends notifications to participants
5. Sends email to participants

---

### Get All Tasks

**GET** `/all-tasks`

Retrieves all tasks in the system.

**Response:** `200 OK`
```json
[
  {
    "_id": "...",
    "taskName": "Implement Authentication",
    "projectId": "project_id",
    "status": "in-progress",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-15T00:00:00.000Z"
  }
]
```

---

### Get Tasks by Project

**GET** `/project-task/:projectId`

Lists all tasks for a specific project.

**Response:** `200 OK`
```json
[...]
```

---

### Get Task by ID

**GET** `/task/:taskId`

Retrieves specific task details.

**Response:** `200 OK`
```json
{
  "_id": "...",
  "taskName": "Implement Authentication",
  "description": "...",
  "participants": [
    {
      "participantId": {
        "username": "dev1",
        "email": "dev@example.com"
      }
    }
  ],
  "updates": [...],
  "resultImages": [...]
}
```

---

### Update Task

**PUT** `/update-task/:taskId`

Updates task details with file handling.

**Form Data:** (All fields optional)
- `taskName`, `description`, `status`
- `participants` (JSON string)
- `relatedDocuments` (files, up to 5)
- `media` (files, up to 5)
- `resultImages` (files, up to 5)
- `deletedDocuments` (JSON string - array of URLs)

**Response:** `200 OK`
```json
{
  "message": "Task updated successfully",
  "task": { ... }
}
```

**File Handling:**
- New uploads added to existing files
- `deletedDocuments` removes specified files
- Uploads to Cloudinary

---

### Delete Task

**DELETE** `/delete-task/:taskId`

Removes a task.

**Response:** `200 OK`
```json
{
  "message": "Task deleted successfully"
}
```

---

### Add Task Update

**POST** `/task/:taskId/update`

Adds progress update to a task.

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

Adds final result images to a task.

**Form Data:**
- `resultImages` (files, up to 5)

**Response:** `201 Created`
```json
{
  "message": "Final result added successfully",
  "task": { ... }
}
```

---

### Delete Task Update

**DELETE** `/task/:taskId/update/:updateId`

Removes a task update.

**Response:** `200 OK`
```json
{
  "message": "Task update deleted successfully"
}
```

---

### Get Task Updates

**GET** `/task-updates/:taskId`

Retrieves all updates for a task.

**Response:** `200 OK`
```json
[
  {
    "_id": "...",
    "description": "Update description",
    "media": ["url1", "url2"],
    "updatedBy": "developer_id",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
]
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

### Add Comment to Update

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
  "message": "Comment added successfully",
  "update": { ... }
}
```

---

### Delete Comment

**DELETE** `/comment/:updateId/:commentId`

Removes a comment.

**Response:** `200 OK`
```json
{
  "message": "Comment deleted successfully"
}
```

---

## Notifications

Task operations trigger:
1. Notifications to participants on create/update
2. Email notifications to participants
3. Notifications for updates and comments

---

## Error Handling

**404 Not Found:**
```json
{
  "message": "Task not found"
}
```

**404 Project Not Found:**
```json
{
  "message": "Project not found"
}
```

**400 Invalid Participants:**
```json
{
  "message": "All participants must be part of the project"
}
```

