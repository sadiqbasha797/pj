# Admin APIs

Complete documentation for all Admin-related endpoints in the Project Management system.

## Base URL
```
/api/admin
```

## Authentication
All Admin endpoints require JWT authentication using the `verifyAdminToken` middleware.

---

## Authentication Endpoints

### Register Admin
**POST** `/register`

Creates a new admin account.

**Request Body:**
```json
{
  "username": "admin_user",
  "password": "password123",
  "email": "admin@example.com"
}
```

**Response:** `201 Created`
```json
{
  "message": "Admin registered successfully",
  "admin": {
    "_id": "...",
    "username": "admin_user",
    "email": "admin@example.com"
  }
}
```

---

### Admin Login
**POST** `/login`

Authenticates an admin and returns a JWT token.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Admin logged in",
  "token": "jwt_token_here",
  "_id": "admin_id",
  "role": "admin",
  "admin": {
    "username": "admin_user",
    "email": "admin@example.com"
  }
}
```

---

## Password Reset

### Initiate Password Reset
**POST** `/initiate-password-reset`

Sends a 6-digit OTP to the admin's email for password reset.

**Request Body:**
```json
{
  "email": "admin@example.com"
}
```

**Response:** `200 OK`
```json
{
  "message": "OTP has been sent to your email",
  "email": "admin@example.com"
}
```

---

### Reset Password
**POST** `/reset-password`

Resets the admin password using the OTP.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "otp": "123456",
  "newPassword": "newpassword123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password reset successful"
}
```

---

## Profile Management

### Get Admin Profile
**GET** `/profile`

Retrieves the authenticated admin's profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "_id": "...",
  "username": "admin_user",
  "email": "admin@example.com",
  "profileImage": "url",
  "companyDetails": {
    "logo": "url",
    "name": "Company Name"
  }
}
```

---

### Update Admin Profile
**PUT** `/profile`

Updates the admin's profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "username": "updated_username",
  "email": "newemail@example.com",
  "companyDetails": {
    "name": "Updated Company Name"
  }
}
```

**Response:** `200 OK`
```json
{
  "message": "Admin profile updated successfully",
  "admin": { ... }
}
```

---

### Update Admin Media
**PUT** `/update-media`

Updates profile image and/or company logo.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `profileImage` (file, optional)
- `companyLogo` (file, optional)

**Response:** `200 OK`
```json
{
  "message": "Media files updated successfully",
  "admin": { ... }
}
```

---

### Delete Admin Profile
**DELETE** `/profile`

Deletes the authenticated admin's account.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "message": "Admin deleted successfully"
}
```

---

## User Management - Developers

### Get All Developers
**GET** `/developers`

Retrieves a list of all developers in the system.

**Response:** `200 OK`
```json
[
  {
    "_id": "...",
    "username": "dev1",
    "email": "dev1@example.com",
    "skills": ["JavaScript", "Node.js"],
    "verified": "yes"
  }
]
```

---

### Register Developer
**POST** `/register-dev`

Creates a new developer account.

**Request Body:**
```json
{
  "username": "new_dev",
  "email": "newdev@example.com",
  "password": "password123",
  "skills": ["JavaScript", "Python"],
  "experience": "2 years"
}
```

**Response:** `201 Created`
```json
{
  "message": "Developer registered successfully",
  "developer": { ... }
}
```

---

### Get Non-Verified Developers
**GET** `/non-verified`

Gets all developers that haven't been verified yet.

**Response:** `200 OK`
```json
[
  {
    "_id": "...",
    "username": "pending_dev",
    "email": "pending@example.com",
    "verified": "no"
  }
]
```

---

### Verify Developer
**POST** `/developer/verify/:developerId`

Marks a developer as verified.

**Parameters:**
- `developerId`: MongoDB ObjectId of the developer

**Response:** `200 OK`
```json
{
  "message": "Developer verified",
  "developer": { ... }
}
```

---

### Update Developer
**PUT** `/update-dev/:developerId`

Updates developer information.

**Parameters:**
- `developerId`: MongoDB ObjectId of the developer

**Request Body:**
```json
{
  "username": "updated_username",
  "email": "newemail@example.com",
  "skills": ["Updated", "Skills"]
}
```

**Response:** `200 OK`
```json
{
  "message": "Developer updated successfully",
  "updatedDeveloper": { ... }
}
```

---

### Delete Developer
**DELETE** `/delete-dev/:developerId`

Deletes a developer from the system.

**Parameters:**
- `developerId`: MongoDB ObjectId of the developer

**Response:** `200 OK`
```json
{
  "message": "Developer deleted successfully"
}
```

---

## User Management - Managers

### Get All Managers
**GET** `/managers`

Retrieves a list of all managers in the system.

**Response:** `200 OK`
```json
[
  {
    "_id": "...",
    "username": "manager1",
    "email": "manager1@example.com",
    "teamSize": 5
  }
]
```

---

### Register Manager
**POST** `/register-manager`

Creates a new manager account with optional team members.

**Request Body:**
```json
{
  "username": "new_manager",
  "email": "newmanager@example.com",
  "password": "password123",
  "developers": ["dev_id_1", "dev_id_2"],
  "digitalMarketingRoles": ["marketer_id_1"],
  "contentCreators": ["creator_id_1"]
}
```

**Response:** `201 Created`
```json
{
  "message": "Manager registered successfully",
  "manager": { ... }
}
```

---

### Update Manager
**PUT** `/update-manager/:managerId`

Updates manager information.

**Parameters:**
- `managerId`: MongoDB ObjectId of the manager

**Request Body:**
```json
{
  "username": "updated_username",
  "email": "newemail@example.com"
}
```

**Response:** `200 OK`
```json
{
  "message": "Manager updated successfully",
  "updatedManager": { ... }
}
```

---

### Delete Manager
**DELETE** `/delete-manager/:managerId`

Deletes a manager from the system.

**Parameters:**
- `managerId`: MongoDB ObjectId of the manager

**Response:** `200 OK`
```json
{
  "message": "Manager deleted successfully"
}
```

---

## User Management - Clients

### Get All Clients
**GET** `/clients`

Retrieves a list of all clients.

**Response:** `200 OK`
```json
[
  {
    "_id": "...",
    "clientName": "Client Name",
    "email": "client@example.com",
    "companyName": "Client Company"
  }
]
```

---

### Register Client
**POST** `/register-client`

Creates a new client account.

**Form Data:**
- `clientName` (text)
- `email` (text)
- `password` (text)
- `companyName` (text)
- `address` (text)
- `mobileNumber` (text)
- `companyLogo` (file, optional)

**Response:** `201 Created`
```json
{
  "message": "Client registered successfully",
  "client": { ... }
}
```

---

### Update Client
**PUT** `/update-client/:clientId`

Updates client information.

**Parameters:**
- `clientId`: MongoDB ObjectId of the client

**Response:** `200 OK`
```json
{
  "message": "Client updated successfully",
  "client": { ... }
}
```

---

### Delete Client
**DELETE** `/delete-client/:clientId`

Deletes a client from the system.

**Parameters:**
- `clientId`: MongoDB ObjectId of the client

**Response:** `200 OK`
```json
{
  "message": "Client deleted successfully"
}
```

---

## Digital Marketing Members

### Get Digital Marketing Members
**GET** `/digital-marketing-members`

Retrieves all digital marketing team members.

**Response:** `200 OK`
```json
[
  {
    "_id": "...",
    "username": "marketer1",
    "email": "marketer@example.com",
    "role": "SEO Specialist"
  }
]
```

---

### Register Digital Marketing User
**POST** `/digital-marketing-user`

Creates a new digital marketing team member.

**Form Data:**
- `username` (text)
- `email` (text)
- `password` (text)
- `image` (file, optional)
- `skills` (text, comma-separated)

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Digital Marketing Role created successfully",
  "data": { ... }
}
```

---

### Delete Digital Marketing User
**DELETE** `/digital-marketing-user/:userId`

Deletes a digital marketing team member.

**Parameters:**
- `userId`: MongoDB ObjectId of the user

**Response:** `200 OK`
```json
{
  "message": "Digital Marketing user deleted successfully"
}
```

---

## Content Creator Members

### Get Content Creator Members
**GET** `/content-creator-members`

Retrieves all content creator team members.

**Response:** `200 OK`
```json
[
  {
    "_id": "...",
    "username": "creator1",
    "email": "creator@example.com",
    "skills": ["Writing", "Design"]
  }
]
```

---

### Register Content Creator
**POST** `/content-creator`

Creates a new content creator account.

**Form Data:**
- `username` (text)
- `email` (text)
- `password` (text)
- `image` (file, optional)
- `skills` (text, comma-separated)

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Content Creator account created successfully",
  "data": { ... }
}
```

---

### Delete Content Creator
**DELETE** `/content-creator/:userId`

Deletes a content creator from the system.

**Parameters:**
- `userId`: MongoDB ObjectId of the creator

**Response:** `200 OK`
```json
{
  "message": "Content Creator deleted successfully"
}
```

---

## Notifications

### Get All Notifications
**GET** `/notifications`

Retrieves all system-wide notifications.

**Response:** `200 OK`
```json
{
  "success": true,
  "notifications": [
    {
      "_id": "...",
      "content": "Notification message",
      "type": "Project",
      "read": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### Mark Notification as Read
**PUT** `/notifications/:notificationId/read`

Marks a specific notification as read.

**Parameters:**
- `notificationId`: MongoDB ObjectId of the notification

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Notification marked as read",
  "notification": { ... }
}
```

---

### Mark All Notifications as Read
**PUT** `/notifications/mark-all-read`

Marks all unread notifications as read.

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

## Team Requests

### Get Pending Requests
**GET** `/pending-requests`

Retrieves all pending team member requests from managers.

**Response:** `200 OK`
```json
{
  "requests": [
    {
      "_id": "...",
      "manager": {
        "_id": "...",
        "username": "manager1",
        "email": "manager@example.com"
      },
      "requestType": "developer",
      "memberId": {...},
      "status": "pending",
      "requestDate": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### Handle Team Request
**PUT** `/team-request/:requestId`

Approves or rejects a team member request.

**Parameters:**
- `requestId`: MongoDB ObjectId of the request

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

## Project Management

All project-related endpoints are documented in [Project APIs](project-apis.md).

Key endpoints available to admins:
- `POST /project` - Create project
- `GET /projects` - Get all projects
- `GET /projects/status` - Get projects by status
- `PUT /project/:projectId` - Update project
- `DELETE /project/:projectId` - Delete project
- `GET /project/:projectId` - Get project by ID

---

## Calendar Management

### Create Event
**POST** `/events`

Creates a new calendar event.

**Request Body:**
```json
{
  "title": "Team Meeting",
  "description": "Quarterly planning",
  "eventDate": "2024-02-01T10:00:00.000Z",
  "participants": [
    {
      "participantId": "user_id",
      "onModel": "Developer"
    }
  ],
  "eventType": "Meeting",
  "location": "Conference Room A",
  "time": "10:00"
}
```

**Response:** `201 Created`
```json
{
  "message": "Event added successfully and emails sent",
  "event": { ... }
}
```

---

### Get All Events
**GET** `/events`

Retrieves all calendar events.

**Response:** `200 OK`
```json
[
  {
    "_id": "...",
    "title": "Team Meeting",
    "eventDate": "2024-02-01T10:00:00.000Z",
    "eventType": "Meeting"
  }
]
```

---

### Get User Events
**GET** `/user-events`

Gets events created by the authenticated admin.

**Response:** `200 OK`
```json
[
  {
    "_id": "...",
    "title": "My Event",
    "createdBy": "admin_id"
  }
]
```

---

### Update Event
**PUT** `/events/:eventId`

Updates an existing calendar event.

**Parameters:**
- `eventId`: MongoDB ObjectId of the event

**Response:** `200 OK`
```json
{
  "message": "Event updated successfully",
  "event": { ... }
}
```

---

### Delete Event
**DELETE** `/events/:eventId`

Deletes a calendar event.

**Parameters:**
- `eventId`: MongoDB ObjectId of the event

**Response:** `200 OK`
```json
{
  "message": "Event deleted successfully"
}
```

---

## Holiday Management

### Get All Holidays
**GET** `/holidays`

Retrieves all holiday requests in the system.

**Response:** `200 OK`
```json
[
  {
    "_id": "...",
    "developer": "dev_id",
    "developerName": "Developer Name",
    "startDate": "2024-02-01T00:00:00.000Z",
    "endDate": "2024-02-05T00:00:00.000Z",
    "reason": "Personal",
    "status": "pending",
    "role": "Developer"
  }
]
```

---

### Approve or Deny Holiday
**PUT** `/holidays/:holidayId`

Approves or denies a holiday request.

**Parameters:**
- `holidayId`: MongoDB ObjectId of the holiday request

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

### Update Holiday
**PUT** `/holidays/update/:holidayId`

Updates holiday request details.

**Parameters:**
- `holidayId`: MongoDB ObjectId of the holiday request

**Response:** `200 OK`
```json
{
  "message": "Holiday updated successfully",
  "holiday": { ... }
}
```

---

### Delete Holiday
**DELETE** `/holidays/delete/:holidayId`

Deletes a holiday request.

**Parameters:**
- `holidayId`: MongoDB ObjectId of the holiday request

**Response:** `200 OK`
```json
{
  "message": "Holiday deleted successfully"
}
```

---

### Get Developer Holidays
**GET** `/holidays/developer/:developerId`

Gets all holidays for a specific developer.

**Parameters:**
- `developerId`: MongoDB ObjectId of the developer

**Response:** `200 OK`
```json
[
  {
    "_id": "...",
    "startDate": "2024-02-01T00:00:00.000Z",
    "endDate": "2024-02-05T00:00:00.000Z",
    "status": "approved"
  }
]
```

---

### Get Holiday by ID
**GET** `/holidays/:holidayId`

Retrieves details of a specific holiday request.

**Parameters:**
- `holidayId`: MongoDB ObjectId of the holiday request

**Response:** `200 OK`
```json
{
  "_id": "...",
  "developer": "dev_id",
  "startDate": "2024-02-01T00:00:00.000Z",
  "endDate": "2024-02-05T00:00:00.000Z",
  "reason": "Personal",
  "status": "pending"
}
```

---

## Task Management

All task-related endpoints are documented in [Task APIs](task-apis.md).

Key endpoints available to admins:
- `POST /add-task` - Create task
- `GET /all-tasks` - Get all tasks
- `GET /project-task/:projectId` - Get tasks for a project
- `PUT /update-task/:taskId` - Update task
- `DELETE /delete-task/:taskId` - Delete task
- `GET /task/:taskId` - Get task by ID

---

## Marketing Task Management

All marketing task endpoints are documented in [Marketing Task APIs](marketing-task-apis.md).

Key endpoints:
- `POST /marketing-task` - Create marketing task
- `GET /marketing-tasks` - Get all marketing tasks
- `PUT /marketing-task/:taskId` - Update marketing task
- `DELETE /marketing-task/:taskId` - Delete marketing task

---

## Revenue Management

All revenue endpoints are documented in [Revenue APIs](revenue-apis.md).

Key endpoints:
- `POST /revenue` - Create revenue entry
- `GET /revenue` - Get all revenue
- `GET /revenue/:projectId` - Get revenue by project
- `PUT /revenue/:revenueId` - Update revenue
- `DELETE /revenue/:revenueId` - Delete revenue

---

## Task Updates

### Get Task Updates
**GET** `/task-updates/:taskId`

Retrieves all updates for a specific task.

**Parameters:**
- `taskId`: MongoDB ObjectId of the task

**Response:** `200 OK`
```json
[
  {
    "_id": "...",
    "description": "Update description",
    "updatedBy": {
      "name": "User Name"
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### Add Comment to Update
**POST** `/comment/:updateId`

Adds a comment to a task update.

**Parameters:**
- `updateId`: MongoDB ObjectId of the update

**Request Body:**
```json
{
  "comment": "Good progress!"
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

Deletes a comment from a task update.

**Parameters:**
- `updateId`: MongoDB ObjectId of the update
- `commentId`: MongoDB ObjectId of the comment

**Response:** `200 OK`
```json
{
  "message": "Comment deleted successfully"
}
```

---

### Add Task Update
**POST** `/task/:taskId/update`

Adds a new update to a task.

**Parameters:**
- `taskId`: MongoDB ObjectId of the task

**Form Data:**
- `description` (text)
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

Adds final result to a task.

**Parameters:**
- `taskId`: MongoDB ObjectId of the task

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

Deletes a task update.

**Parameters:**
- `taskId`: MongoDB ObjectId of the task
- `updateId`: MongoDB ObjectId of the update

**Response:** `200 OK`
```json
{
  "message": "Task update deleted successfully"
}
```

---

## Testing Routes

### Project Reminder Test
**GET** `/project-reminder-test`

Manually triggers project reminder emails for testing.

**Response:** `200 OK`
```json
{
  "emailsSent": 5,
  "message": "Reminders sent successfully"
}
```

---

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200` - Success
- `201` - Created successfully
- `400` - Bad request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not found
- `500` - Server error

Common error response format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

