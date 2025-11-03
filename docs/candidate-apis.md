# Candidate APIs

Complete documentation for Candidate and Recruitment-related endpoints.

## Base URL
```
/api/candidates
```

## Authentication
All Candidate endpoints require authentication using `verifyAdminHrToken` middleware (accessible by both Admin and HR).

---

## Candidate Management

### Create Candidate
**POST** `/`

Creates a new candidate with job application.

**Form Data:**
- `name` (text)
- `email` (text)
- `phone` (text)
- `experience` (text)
- `education` (text)
- `skills` (array)
- `jobId` (text, required)
- `resume` (file, required)

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Candidate created successfully",
  "candidate": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "jobsApplied": [
      {
        "job": "job_id",
        "appliedDate": "2024-01-01T00:00:00.000Z",
        "status": "pending"
      }
    ]
  }
}
```

---

### Get All Candidates
**GET** `/`

Lists all candidates with their job applications.

**Response:** `200 OK`
```json
[
  {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "jobsApplied": [
      {
        "job": { ... },
        "status": "pending"
      }
    ]
  }
]
```

---

### Get Candidate by ID
**GET** `/:id`

Retrieves specific candidate details.

**Response:** `200 OK`
```json
{
  "_id": "...",
  "name": "John Doe",
  "email": "john@example.com",
  "resume": "resume_url",
  "jobsApplied": [...]
}
```

---

### Update Candidate
**PUT** `/:id`

Updates candidate information.

**Form Data:**
- `name`, `email`, `phone` (optional)
- `resume` (file, optional)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Candidate updated successfully",
  "candidate": { ... }
}
```

---

### Delete Candidate
**DELETE** `/:id`

Removes a candidate from the system.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Candidate deleted successfully"
}
```

---

## Job Applications

### Apply for Job
**POST** `/:candidateId/apply/:jobId`

Adds a new job application for an existing candidate.

**Parameters:**
- `candidateId`: Candidate MongoDB ObjectId
- `jobId`: Job MongoDB ObjectId

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Job application submitted successfully",
  "candidate": { ... }
}
```

---

### Update Application Status
**PUT** `/:candidateId/application/:jobId/status`

Updates the status of a job application.

**Request Body:**
```json
{
  "status": "shortlisted"
}
```

**Valid Status Values:**
- `pending`
- `shortlisted`
- `interviewed`
- `rejected`
- `hired`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Application status updated successfully",
  "candidate": { ... }
}
```

---

## Error Handling

**404 Not Found:**
```json
{
  "success": false,
  "message": "Candidate not found"
}
```

**400 Bad Request:**
```json
{
  "success": false,
  "message": "This job posting is no longer active"
}
```

**409 Conflict:**
```json
{
  "success": false,
  "message": "Candidate has already applied for this job"
}
```

