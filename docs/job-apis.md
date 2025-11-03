# Job Management APIs

Complete documentation for Job Posting endpoints.

## Base URL
```
/api/jobs
```

## Authentication
All Job endpoints require authentication using `verifyAdminHrToken` middleware.

---

## Job Management

### Create Job
**POST** `/`

Creates a new job posting.

**Form Data:**
- `title` (text, required)
- `description` (text, required)
- `role` (text, required)
- `requirements` (array, required)
- `salaryOffered` (object)
  - `min` (number)
  - `max` (number)
  - `currency` (text, default: "USD")
- `dates` (object)
  - `deadline` (date, required)
- `location` (text)
- `employmentType` (text)
- `status` (text, default: "active")
- `attachments` (files, up to 5)

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Job created successfully",
  "job": {
    "_id": "...",
    "title": "Senior Developer",
    "role": "Software Engineer",
    "status": "active",
    "salaryOffered": {
      "min": 80000,
      "max": 120000,
      "currency": "USD"
    },
    "dates": {
      "posted": "2024-01-01T00:00:00.000Z",
      "deadline": "2024-02-01T00:00:00.000Z"
    }
  }
}
```

---

### Get All Jobs
**GET** `/`

Retrieves all jobs with optional filtering.

**Query Parameters:**
- `status` (optional): Filter by status
- `role` (optional): Filter by role (case-insensitive search)
- `salaryMin` (optional): Minimum salary filter
- `salaryMax` (optional): Maximum salary filter
- `deadline` (optional): Filter by deadline date
- `sortBy` (optional): Sort field (default: "dates.posted")
- `sortOrder` (optional): Sort direction (default: -1)

**Example Request:**
```
GET /api/jobs?status=active&role=developer&salaryMin=50000&sortBy=dates.posted&sortOrder=-1
```

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 10,
  "jobs": [
    {
      "_id": "...",
      "title": "Senior Developer",
      "role": "Software Engineer",
      "status": "active",
      "salaryOffered": { ... },
      "createdBy": {
        "username": "admin1"
      }
    }
  ]
}
```

---

### Get Job by ID
**GET** `/:id`

Retrieves specific job details.

**Response:** `200 OK`
```json
{
  "success": true,
  "job": {
    "_id": "...",
    "title": "Senior Developer",
    "description": "Job description",
    "requirements": ["Skill 1", "Skill 2"],
    "salaryOffered": { ... },
    "dates": { ... },
    "attachments": [...]
  }
}
```

---

### Update Job
**PUT** `/:id`

Updates job posting details.

**Form Data:** (All fields optional)
- `title`, `description`, `role`
- `requirements` (array)
- `salaryOffered` (object)
- `dates.deadline` (date)
- `location`, `employmentType`, `status`
- `attachments` (files, up to 5)

**Note:** Uploading new attachments replaces all old attachments.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Job updated successfully",
  "job": { ... }
}
```

---

### Delete Job
**DELETE** `/:id`

Deletes a job posting.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Job deleted successfully"
}
```

---

## Status Management

Valid job statuses:
- `active` - Job is currently accepting applications
- `closed` - Job is no longer accepting applications
- `draft` - Job is not yet published

---

## Error Handling

**404 Not Found:**
```json
{
  "success": false,
  "message": "Job not found"
}
```

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Invalid job data"
}
```

**500 Server Error:**
```json
{
  "success": false,
  "message": "Error creating job",
  "error": "Detailed error message"
}
```

