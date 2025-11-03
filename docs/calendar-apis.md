# Calendar & Events APIs

Complete documentation for Calendar and Event management endpoints.

## Overview

Calendar events support multiple event types and participant roles. Events can be created by any authenticated user and support notifications and email invitations.

## Shared Endpoints

Calendar APIs are integrated across multiple role-specific routes:
- Admin: `/api/admin/events`
- Manager: `/api/manager/events`
- Developer: `/api/developer/events`
- Digital Marketing: `/api/digital-marketing/add-event`
- Content Creator: `/api/content-creator/add-event`
- Client: `/api/client/calendar/event`

---

## Event Types

- **Meeting** - Team meetings with participants
- **Task** - Task-related calendar entries
- **Project Deadline** - Project completion dates
- **Holiday** - Employee leave/holiday requests
- **Custom** - User-defined events

---

## Common Event Operations

### Create Event

**POST** `/[role-specific-path]/events` or `/add-event`

**Request Body:**
```json
{
  "title": "Quarterly Planning",
  "description": "Q1 2024 planning session",
  "eventDate": "2024-02-01T10:00:00.000Z",
  "endDate": "2024-02-01T12:00:00.000Z",
  "participants": [
    {
      "participantId": "user_id",
      "onModel": "Developer"
    }
  ],
  "eventType": "Meeting",
  "projectId": "project_id",
  "location": "Conference Room A",
  "time": "10:00",
  "isAllDay": false
}
```

**Response:** `201 Created`
```json
{
  "message": "Event added successfully and emails sent",
  "event": {
    "_id": "...",
    "title": "Quarterly Planning",
    "eventDate": "2024-02-01T10:00:00.000Z",
    "eventType": "Meeting",
    "status": "Active"
  }
}
```

**Automated Actions:**
1. Creates calendar event
2. Sends email invitations to all participants
3. Creates notifications for participants
4. For Meeting type: Generates .ics calendar file attachment

---

### Update Event

**PUT** `/:eventId` or `/update-event/:eventId`

**Request Body:**
```json
{
  "title": "Updated Meeting",
  "eventDate": "2024-02-02T14:00:00.000Z",
  "description": "Updated description"
}
```

**Response:** `200 OK`
```json
{
  "message": "Event updated successfully",
  "event": { ... }
}
```

**Project Deadline Events:** Automatically updates linked project deadline.

---

### Delete Event

**DELETE** `/:eventId` or `/delete-event/:eventId`

**Response:** `200 OK`
```json
{
  "message": "Event deleted successfully"
}
```

**Project Deadline Events:** Sets linked project deadline to null.

---

### Get All Events

**GET** `/events`

Retrieves all events in the system.

**Response:** `200 OK`
```json
[
  {
    "_id": "...",
    "title": "Team Meeting",
    "eventDate": "2024-02-01T10:00:00.000Z",
    "eventType": "Meeting",
    "location": "Conference Room A"
  }
]
```

---

### Get User Events

**GET** `/user-events`

Retrieves events created by the authenticated user.

**Response:** `200 OK`
```json
[...]
```

---

## Role-Specific Endpoints

### Developer Events

**GET** `/developer-events`

Lists events where developer is creator or participant, with `byMe` flag.

**Response:** `200 OK`
```json
[
  {
    "_id": "...",
    "title": "Meeting",
    "byMe": true
  }
]
```

---

### Client Meetings

**GET** `/api/client/meetings`

Lists all meetings for a client with detailed participant information.

**Response:** `200 OK`
```json
{
  "success": true,
  "meetings": [
    {
      "_id": "...",
      "title": "Project Review",
      "eventDate": "2024-02-01T10:00:00.000Z",
      "location": "Conference Room A",
      "creator": {
        "_id": "...",
        "name": "Manager Name",
        "role": "Manager"
      },
      "participants": [
        {
          "_id": "...",
          "name": "Developer Name",
          "role": "Developer"
        }
      ]
    }
  ]
}
```

---

## Notifications

All event types create notifications:
- For events with participants: Individual notifications for each participant
- For events without participants: System-wide notification (null recipient)

---

## Email Features

### Meeting Invitations

Meeting type events include:
- Email with event details
- .ics calendar file attachment for easy import
- Preparation instructions
- Location details

### Event Updates

Updates to events trigger:
- Email notifications to all participants
- Updated calendar attachments (if applicable)

---

## Error Handling

**404 Not Found:**
```json
{
  "message": "Event not found"
}
```

**404 Project Not Found:**
```json
{
  "message": "Related project not found"
}
```

---

## Participant Models

Supported participant types:
- `Admin`
- `Manager`
- `Developer`
- `DigitalMarketingRole`
- `ContentCreator`
- `Client`

