# Offer Letter APIs

Complete documentation for Offer Letter management endpoints.

## Base URL
```
/api/offer-letters
```

## Authentication
All Offer Letter endpoints require authentication using `verifyAdminHrToken` middleware.

---

## Offer Letter Management

### Create Offer Letter
**POST** `/`

Creates a new offer letter, generates PDF, uploads to cloud, and emails to candidate.

**Request Body:**
```json
{
  "candidate": {
    "id": "candidate_id",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "jobId": "job_id",
  "offerDate": "2024-02-01",
  "joiningDate": "2024-03-01",
  "offerDetails": {
    "position": "Senior Software Engineer",
    "location": "San Francisco, CA",
    "salary": "$120,000/year",
    "benefits": [
      "Health Insurance",
      "401(k) matching",
      "Paid time off"
    ]
  },
  "termsAndConditions": "Standard employment terms apply"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Offer letter created and sent successfully",
  "offerLetter": {
    "_id": "...",
    "candidate": { ... },
    "offerDate": "2024-02-01",
    "offerLetterUrl": "https://cloudinary.com/offer_letter.pdf"
  }
}
```

**Automated Actions:**
1. PDF generation
2. Cloud upload
3. Email to candidate with PDF attachment
4. Candidate application status updated

---

### Get All Offer Letters
**GET** `/`

Lists all offer letters with candidate and creator details.

**Response:** `200 OK`
```json
{
  "success": true,
  "offerLetters": [
    {
      "_id": "...",
      "candidate": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "offerDetails": {
        "position": "Senior Software Engineer",
        "salary": "$120,000/year"
      },
      "offerDate": "2024-02-01",
      "joiningDate": "2024-03-01",
      "status": "pending"
    }
  ]
}
```

---

### Get Offer Letter by ID
**GET** `/:id`

Retrieves specific offer letter details.

**Response:** `200 OK`
```json
{
  "success": true,
  "offerLetter": {
    "_id": "...",
    "candidate": { ... },
    "offerDetails": { ... },
    "offerLetterUrl": "pdf_url",
    "termsAndConditions": "..."
  }
}
```

---

### Update Offer Letter Status
**PATCH** `/:id/status`

Updates offer letter status based on candidate response.

**Valid Status Values:**
- `pending` - Awaiting response
- `accepted` - Candidate accepted
- `rejected` - Candidate declined
- `expired` - Offer expired

**Request Body:**
```json
{
  "status": "accepted",
  "responseDate": "2024-02-05"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Offer letter status updated successfully",
  "offerLetter": { ... }
}
```

---

### Delete Offer Letter
**DELETE** `/:id`

Deletes an offer letter.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Offer letter deleted successfully"
}
```

---

## PDF Generation

Offer letter PDFs include:
- Company letterhead/logo
- Candidate name
- Position details
- Salary information
- Benefits list
- Joining date
- Terms and conditions
- Signature section

---

## Email Notification

Offer letter emails include:
- Congratulations message
- Position details
- Salary and benefits
- Joining date
- PDF attachment
- Acceptance instructions

---

## Error Handling

**404 Not Found:**
```json
{
  "success": false,
  "message": "Offer letter not found"
}
```

**404 Candidate Not Found:**
```json
{
  "success": false,
  "message": "Candidate not found"
}
```

**500 Error:**
```json
{
  "success": false,
  "message": "Error creating offer letter",
  "error": "Detailed error"
}
```

