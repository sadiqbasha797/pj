# HR APIs

Complete documentation for HR-related endpoints.

## Base URL
```
/api/hr
```

## Authentication
All HR endpoints require JWT authentication using the `verifyHrToken` middleware.

---

## Authentication Endpoints

### HR Registration
**POST** `/register`

Creates a new HR account.

**Request Body:**
```json
{
  "name": "HR Manager",
  "email": "hr@example.com",
  "password": "password123"
}
```

**Response:** `201 Created`
```json
{
  "message": "HR registered successfully",
  "token": "jwt_token_here",
  "hr": {
    "id": "hr_id",
    "name": "HR Manager",
    "email": "hr@example.com"
  }
}
```

---

### HR Login
**POST** `/login`

Authenticates an HR user.

**Request Body:**
```json
{
  "email": "hr@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "hr": {
    "id": "hr_id",
    "name": "HR Manager",
    "email": "hr@example.com"
  }
}
```

---

## Profile Management

### Get HR Profile
**GET** `/profile`

Retrieves HR profile.

**Response:** `200 OK`
```json
{
  "_id": "...",
  "name": "HR Manager",
  "email": "hr@example.com"
}
```

---

### Update HR Profile
**PUT** `/profile`

Updates HR profile.

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "newemail@example.com"
}
```

**Response:** `200 OK`
```json
{
  "message": "Profile updated successfully",
  "hr": { ... }
}
```

---

## Employee Management

### Get All Developers
**GET** `/developers`

Lists all developers.

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

### Get Digital Marketers
**GET** `/digital-marketers`

Lists all digital marketing team members.

**Response:** `200 OK`
```json
[...]
```

---

### Get Content Creators
**GET** `/content-creators`

Lists all content creators.

**Response:** `200 OK`
```json
[...]
```

---

### Register Developer
**POST** `/register-developer`

Creates a new developer account.

**Form Data:**
- `username` (text)
- `email` (text)
- `password` (text)
- `skills` (text)
- `experience` (text)
- `resume` (file, optional)

**Response:** `201 Created`
```json
{
  "message": "Developer registered successfully",
  "developer": { ... }
}
```

---

### Register Digital Marketer
**POST** `/register-digital-marketer`

Creates a new digital marketer account.

**Form Data:**
- `username` (text)
- `email` (text)
- `password` (text)
- `image` (file, optional)
- `skills` (text)

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Digital Marketing Role created successfully"
}
```

---

### Register Content Creator
**POST** `/register-content-creator`

Creates a new content creator account.

**Form Data:**
- `username` (text)
- `email` (text)
- `password` (text)
- `image` (file, optional)
- `skills` (text)

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Content Creator account created successfully"
}
```

---

### Delete Developer
**DELETE** `/delete-developer/:developerId`

Removes a developer from the system.

**Response:** `200 OK`
```json
{
  "message": "Developer deleted successfully"
}
```

---

### Delete Digital Marketer
**DELETE** `/delete-digital-marketer/:userId`

Removes a digital marketer.

**Response:** `200 OK`
```json
{
  "message": "Digital Marketing user deleted successfully"
}
```

---

### Delete Content Creator
**DELETE** `/delete-content-creator/:userId`

Removes a content creator.

**Response:** `200 OK`
```json
{
  "message": "Content Creator deleted successfully"
}
```

---

## Team Request Management

### Get Pending Requests
**GET** `/pending-requests`

Lists all pending team member requests.

**Response:** `200 OK`
```json
{
  "requests": [
    {
      "_id": "...",
      "manager": {
        "username": "manager1",
        "email": "manager@example.com"
      },
      "requestType": "developer",
      "status": "pending",
      "requestDate": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### Handle Team Request
**PUT** `/team-request/:requestId`

Approves or rejects a team request.

**Request Body:**
```json
{
  "status": "approved",
  "notes": "Request approved"
}
```

**Response:** `200 OK`
```json
{
  "message": "Request approved successfully",
  "request": { ... }
}
```

---

## Payslip Management

All payslip endpoints are documented in [Payslip APIs](payslip-apis.md).

Key endpoints:
- `POST /payslip/create` - Create payslip
- `GET /payslips` - Get all payslips
- `GET /payslip/employee/:employeeId/:role` - Get employee payslips
- `PUT /payslip/:payslipId` - Update payslip
- `DELETE /payslip/:payslipId` - Delete payslip
- `GET /payslip/stats` - Get payslip statistics

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
    "status": "pending",
    "reason": "Personal"
  }
]
```

---

### Approve/Deny Holiday
**PUT** `/holiday/:holidayId`

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

## Notifications

### Get All Notifications
**GET** `/notifications`

Lists all HR-related notifications.

**Response:** `200 OK`
```json
{
  "success": true,
  "notifications": [...]
}
```

---

### Mark Notification as Read
**PUT** `/notifications/:notificationId/read`

Marks a notification as read.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

### Mark All as Read
**PUT** `/notifications/read-all`

Marks all notifications as read.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

## Payslip APIs Reference

Full documentation available at [Payslip APIs](payslip-apis.md).

### Create Payslip
**POST** `/payslip/create`

Creates a new payslip for an employee.

**Request Body:**
```json
{
  "employeeId": "employee_id",
  "amount": 5000,
  "paidDate": "2024-02-01",
  "description": "Monthly salary",
  "employeeRole": "developer"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Payslip created successfully",
  "data": { ... }
}
```

---

### Get All Payslips
**GET** `/payslips`

Lists all payslips in the system.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "paidTo": {
        "name": "Employee Name",
        "role": "developer"
      },
      "amount": 5000,
      "paidDate": "2024-02-01T00:00:00.000Z"
    }
  ]
}
```

---

### Get Employee Payslips
**GET** `/payslip/employee/:employeeId/:role`

Lists all payslips for a specific employee.

**Parameters:**
- `employeeId`: Employee MongoDB ObjectId
- `role`: Employee role (developer, digital-marketing, content-creator)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [...]
}
```

---

### Update Payslip
**PUT** `/payslip/:payslipId`

Updates a payslip.

**Request Body:**
```json
{
  "amount": 5500,
  "description": "Updated description"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Payslip updated successfully"
}
```

---

### Delete Payslip
**DELETE** `/payslip/:payslipId`

Deletes a payslip.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Payslip deleted successfully"
}
```

---

### Get Payslip Statistics
**GET** `/payslip/stats`

Gets payslip statistics and summaries.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalPayslips": 50,
    "totalAmount": 250000,
    "employees": 10
  }
}
```

