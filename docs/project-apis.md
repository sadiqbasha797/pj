# Project Management APIs

Complete documentation for Project endpoints.

## Base URL
```
/api/admin/project
/api/manager/project
```

## Authentication
Project endpoints are available to Admins and Managers.

---

## Project Management

### Create Project

**POST** `/project`

Creates a new project with optional file uploads.

**Form Data:**
- `title` (text, required)
- `description` (text, required)
- `deadline` (date, required)
- `assignedTo` (JSON array of developer IDs, required)
- `status` (text, optional)
- `relatedDocs` (files, up to 5, optional)

**Example:**
```javascript
FormData {
  title: "E-commerce Platform",
  description: "Build new e-commerce platform",
  deadline: "2024-03-01",
  assignedTo: ["dev_id_1", "dev_id_2"],
  status: "in-progress",
  relatedDocs: [file1, file2]
}
```

**Response:** `201 Created`
```json
{
  "message": "Project added successfully and event created",
  "project": {
    "_id": "...",
    "title": "E-commerce Platform",
    "description": "Build new e-commerce platform",
    "deadline": "2024-03-01T00:00:00.000Z",
    "assignedTo": ["dev_id_1", "dev_id_2"],
    "status": "in-progress",
    "relatedDocs": ["url1", "url2"]
  }
}
```

**Automated Actions:**
1. Creates project document
2. Creates corresponding calendar event for deadline
3. Sends notifications to assigned developers
4. Sends notifications to managers of those developers
5. Sends email to all assigned developers

---

### Get All Projects

**GET** `/projects`

Retrieves all projects in the system.

**Response:** `200 OK`
```json
[
  {
    "_id": "...",
    "title": "E-commerce Platform",
    "description": "...",
    "deadline": "2024-03-01T00:00:00.000Z",
    "status": "in-progress",
    "assignedTo": ["dev_id_1", "dev_id_2"],
    "createdBy": "admin_id",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### Get Projects by Status

**GET** `/projects/status`

Filters projects by status.

**Query Parameters:**
- `status` (required): Project status

**Valid Statuses:**
- `planning`
- `in-progress`
- `on-hold`
- `completed`
- `cancelled`

**Response:** `200 OK`
```json
[...]
```

---

### Get Project by ID

**GET** `/project/:projectId`

Retrieves specific project details.

**Response:** `200 OK`
```json
{
  "_id": "...",
  "title": "E-commerce Platform",
  "description": "...",
  "deadline": "2024-03-01T00:00:00.000Z",
  "assignedTo": [...],
  "relatedDocs": [...],
  "status": "in-progress",
  "createdBy": "admin_id"
}
```

---

### Get Assigned Developers

**GET** `/project/assigned-developers/:projectId`

Lists all developers assigned to a project.

**Response:** `200 OK`
```json
[
  {
    "_id": "...",
    "username": "dev1",
    "email": "dev@example.com",
    "skills": ["JavaScript", "Node.js"]
  }
]
```

---

### Update Project

**PUT** `/project/:projectId`

Updates project details.

**Form Data:** (All fields optional)
- `title`, `description`, `deadline`, `status`
- `assignedTo` (JSON array)
- `relatedDocs` (files, up to 5)

**Note:** Uploading new docs replaces all existing docs.

**Response:** `200 OK`
```json
{
  "message": "Project updated successfully",
  "project": { ... }
}
```

**Automated Actions:**
1. Updates project
2. If assignedTo changed: Sends notifications to newly assigned developers
3. If deadline changed: Updates corresponding calendar event

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

**Automated Actions:**
1. Deletes project document
2. Deletes corresponding calendar event
3. Removes related tasks (cascade deletion)

---

## Email Integration

Project assignment emails include:
- Project title
- Description
- Deadline
- List of related documents with URLs
- Assignment notification

---

## Notifications

Project creation/update triggers:
1. Notifications to assigned developers
2. Notifications to managers of those developers
3. System-wide notifications (null recipient)

---

## Error Handling

**404 Not Found:**
```json
{
  "message": "Project not found"
}
```

**400 Bad Request:**
```json
{
  "message": "assignedTo must be an array"
}
```

**400 Invalid Format:**
```json
{
  "message": "Invalid assignedTo format"
}
```

---

## Integration with Tasks

Projects automatically link to:
- Calendar events (deadline)
- Tasks (sub-tasks)
- Marketing tasks (marketing projects)
- Revenue entries

