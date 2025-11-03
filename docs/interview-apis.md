# Interview APIs

Complete documentation for Interview scheduling endpoints.

## Base URL
```
/api/interviews
```

## Authentication
All Interview endpoints require authentication using `verifyAdminHrToken` middleware.

---

## Interview Management

### Create Interview
**POST** `/`

Schedules a new interview and sends email notification to candidate.

**Request Body:**
```json
{
  "name": "Technical Interview",
  "interviewDate": "2024-02-10T14:00:00.000Z",
  "interviewLink": "https://meet.google.com/xyz",
  "candidate": {
    "id": "candidate_id",
    "name": "John Doe"
  },
  "jobId": "job_id",
  "interviewerName": "Jane Smith",
  "interviewType": "Technical",
  "duration": 60,
  "additionalNotes": "Bring laptop"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Interview scheduled successfully",
  "interview": {
    "_id": "...",
    "name": "Technical Interview",
    "interviewDate": "2024-02-10T14:00:00.000Z",
    "candidate": { ... },
    "jobId": "job_id"
  }
}
```

**Email Notification:** Automatically sent to candidate with interview details.

---

### Get All Interviews
**GET** `/`

Lists all interviews with candidate and creator details.

**Response:** `200 OK`
```json
{
  "success": true,
  "interviews": [
    {
      "_id": "...",
      "name": "Technical Interview",
      "interviewDate": "2024-02-10T14:00:00.000Z",
      "candidate": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "createdBy": {
        "username": "hr1",
        "email": "hr@example.com"
      }
    }
  ]
}
```

---

### Get Interview by ID
**GET** `/:id`

Retrieves specific interview details.

**Response:** `200 OK`
```json
{
  "success": true,
  "interview": {
    "_id": "...",
    "name": "Technical Interview",
    "interviewDate": "2024-02-10T14:00:00.000Z",
    "interviewLink": "https://meet.google.com/xyz",
    "candidate": { ... },
    "interviewType": "Technical",
    "duration": 60
  }
}
```

---

### Update Interview
**PUT** `/:id`

Updates interview details and sends update email to candidate.

**Request Body:**
```json
{
  "interviewDate": "2024-02-12T15:00:00.000Z",
  "interviewLink": "https://meet.google.com/new_link",
  "additionalNotes": "Updated instructions"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Interview updated successfully",
  "interview": { ... }
}
```

**Email Notification:** Update email sent to candidate.

---

### Update Interview Status
**PATCH** `/:id/status`

Updates interview status (e.g., completed, cancelled).

**Request Body:**
```json
{
  "status": "completed",
  "feedback": "Candidate performed well"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Interview status updated successfully",
  "interview": { ... }
}
```

---

### Delete Interview
**DELETE** `/:id`

Deletes an interview.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Interview deleted successfully"
}
```

---

## Email Templates

Interview emails include:
- Interview date and time
- Interview link (if applicable)
- Interviewer name
- Interview type
- Duration
- Additional notes/instructions
- Preparation tips

---

## Error Handling

**404 Not Found:**
```json
{
  "success": false,
  "message": "Interview not found"
}
```

**404 Candidate Not Found:**
```json
{
  "success": false,
  "message": "Candidate not found"
}
```

