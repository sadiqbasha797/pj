# Payslip APIs

Complete documentation for Payslip management endpoints.

## Base URL
```
/api/payslip
```

## Authentication
All Payslip endpoints require authentication using `verifyHrToken` middleware.

---

## Payslip Management

### Create Payslip
**POST** `/create`

Creates a new payslip and sends email notification to employee.

**Request Body:**
```json
{
  "employeeId": "employee_id",
  "amount": 5000,
  "paidDate": "2024-02-01",
  "description": "February 2024 Salary",
  "employeeRole": "developer"
}
```

**Valid Employee Roles:**
- `developer`
- `digital-marketing`
- `content-creator`

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Payslip created successfully",
  "data": {
    "_id": "...",
    "paidTo": {
      "id": "employee_id",
      "name": "John Doe",
      "role": "developer",
      "model": "Developer"
    },
    "amount": 5000,
    "paidDate": "2024-02-01T00:00:00.000Z",
    "description": "February 2024 Salary"
  }
}
```

**Automated Actions:**
1. Email notification to employee
2. System notification to employee
3. Notification to HR

---

### Get All Payslips
**GET** `/all`

Retrieves all payslips in the system, sorted by date (newest first).

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "paidTo": {
        "name": "John Doe",
        "role": "developer"
      },
      "amount": 5000,
      "paidDate": "2024-02-01T00:00:00.000Z",
      "description": "February 2024 Salary",
      "createdBy": "hr_id"
    }
  ]
}
```

---

### Get Employee Payslips
**GET** `/employee/:employeeId/:role`

Retrieves all payslips for a specific employee.

**Parameters:**
- `employeeId`: MongoDB ObjectId of the employee
- `role`: Employee role (developer, digital-marketing, content-creator)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "amount": 5000,
      "paidDate": "2024-02-01T00:00:00.000Z",
      "description": "February 2024 Salary"
    }
  ]
}
```

---

### Update Payslip
**PUT** `/:payslipId`

Updates payslip details.

**Request Body:**
```json
{
  "amount": 5500,
  "paidDate": "2024-02-01",
  "description": "Updated description"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Payslip updated successfully",
  "data": { ... }
}
```

**Note:** Sends notification to employee about update.

---

### Delete Payslip
**DELETE** `/:payslipId`

Deletes a payslip from the system.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Payslip deleted successfully"
}
```

---

### Get Payslip Statistics
**GET** `/stats`

Retrieves payslip statistics and summaries.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalPayslips": 50,
    "totalAmount": 250000,
    "employeesPaid": 10,
    "averageAmount": 5000
  }
}
```

---

## Email Notifications

Payslip emails include:
- Employee name
- Pay amount
- Payment date
- Description
- Instructions to view in system

---

## Notifications

Employees receive:
- Email notification
- In-app notification when payslip is created

HR receives:
- Confirmation notification

---

## Error Handling

**404 Not Found:**
```json
{
  "success": false,
  "message": "Employee not found"
}
```

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Invalid employee role"
}
```

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Payslip not found"
}
```

---

## Usage Examples

### Create Monthly Salary Payslip
```bash
POST /api/payslip/create
{
  "employeeId": "dev123",
  "amount": 5000,
  "paidDate": "2024-02-01",
  "description": "February 2024 Salary",
  "employeeRole": "developer"
}
```

### View Employee History
```bash
GET /api/payslip/employee/dev123/developer
```

### Get System Statistics
```bash
GET /api/payslip/stats
```

