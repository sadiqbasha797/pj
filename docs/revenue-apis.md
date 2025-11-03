# Revenue Management APIs

Complete documentation for Revenue tracking endpoints.

## Base URL
```
/api/admin
/api/manager
/api/digital-marketing
/api/content-creator
```

## Authentication
Revenue endpoints are available to Admin, Manager, Digital Marketing, and Content Creator roles.

---

## Revenue Management

### Create Revenue Entry

**POST** `/revenue`

Creates a new revenue entry with optional attachments.

**Form Data:**
- `projectId` (text, optional - links to project)
- `revenueGenerated` (number, required)
- `description` (text, required)
- `attachments` (files, up to 5, optional)

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Revenue entry created successfully",
  "data": {
    "_id": "...",
    "projectId": "project_id",
    "revenueGenerated": 50000,
    "description": "Project completion payment",
    "attachments": ["url1", "url2"],
    "createdBy": {
      "id": "user_id",
      "name": "marketer1",
      "role": "digital-marketing"
    },
    "date": "2024-02-01T00:00:00.000Z"
  }
}
```

**Automated Actions:**
1. Creates revenue entry
2. Sends email notification to all admins and managers
3. Creates system-wide notification

---

### Get All Revenue

**GET** `/revenue`

Retrieves all revenue entries, sorted by date (newest first).

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "projectId": {
        "_id": "...",
        "title": "Project Name",
        "status": "completed"
      },
      "revenueGenerated": 50000,
      "description": "Payment received",
      "createdBy": {
        "name": "Admin",
        "role": "admin"
      },
      "date": "2024-02-01T00:00:00.000Z"
    }
  ]
}
```

---

### Get Revenue by Project

**GET** `/revenue/:projectId`
**GET** `/revenue/project/:projectId`

Lists all revenue entries for a specific project.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "revenueGenerated": 25000,
      "description": "Partial payment",
      "date": "2024-01-15T00:00:00.000Z"
    }
  ]
}
```

---

### Update Revenue Entry

**PUT** `/revenue/:revenueId`

Updates revenue details.

**Form Data:**
- `revenueGenerated` (number, optional)
- `description` (text, optional)
- `projectId` (text, optional)
- `attachments` (files, up to 5, optional)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Revenue entry updated successfully",
  "data": { ... }
}
```

---

### Delete Revenue Entry

**DELETE** `/revenue/:revenueId`

Removes a revenue entry.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Revenue entry deleted successfully"
}
```

---

## Notifications

Revenue operations trigger:
1. Email to all admins
2. Email to all managers
3. System-wide notification

---

## Email Features

Revenue emails include:
- Revenue amount
- Description
- Creator information
- Project details (if linked)
- Attachment count

---

## Error Handling

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Only admins, managers, and digital marketers can create revenue entries"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Revenue entry not found"
}
```

**500 Server Error:**
```json
{
  "success": false,
  "message": "Error creating revenue entry",
  "error": "Detailed error"
}
```

---

## Usage Examples

### Record Project Payment
```bash
POST /api/digital-marketing/revenue
{
  projectId: "proj123",
  revenueGenerated: 50000,
  description: "Final milestone payment",
  attachments: [invoice.pdf]
}
```

### View Project Revenue
```bash
GET /api/admin/revenue/proj123
```

### Update Revenue
```bash
PUT /api/admin/revenue/rev456
{
  revenueGenerated: 55000,
  description: "Updated amount"
}
```

