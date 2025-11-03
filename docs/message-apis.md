# Message APIs

Complete documentation for real-time messaging endpoints.

## Base URL
```
/api/message
```

## Authentication
All Message endpoints require authentication using the `messageAuth` middleware.

---

## Message Management

### Send Message
**POST** `/send`

Sends a message to another user. Triggers real-time WebSocket notification.

**Request Body:**
```json
{
  "receiverId": "user_id",
  "receiverRole": "developer",
  "content": "Hello, how are you?"
}
```

**Response:** `201 Created`
```json
{
  "_id": "...",
  "sender": {
    "id": "sender_id",
    "role": "admin"
  },
  "receiver": {
    "id": "receiver_id",
    "role": "developer"
  },
  "content": "Hello, how are you?",
  "read": false,
  "createdAt": "2024-01-01T10:00:00.000Z"
}
```

**Real-time:** Recipient receives WebSocket notification immediately.

---

### Get Conversation
**GET** `/conversation/:otherUserId`

Retrieves conversation history between current user and another user.

**Parameters:**
- `otherUserId`: MongoDB ObjectId of the other user

**Response:** `200 OK`
```json
[
  {
    "_id": "...",
    "sender": {
      "id": "user1_id",
      "role": "admin"
    },
    "receiver": {
      "id": "user2_id",
      "role": "developer"
    },
    "content": "Message content",
    "read": true,
    "createdAt": "2024-01-01T10:00:00.000Z"
  }
]
```

**Note:** Messages are sorted chronologically from oldest to newest.

---

### Mark Message as Read
**PATCH** `/read/:messageId`

Marks a specific message as read.

**Parameters:**
- `messageId`: MongoDB ObjectId of the message

**Response:** `200 OK`
```json
{
  "_id": "...",
  "read": true,
  "updatedAt": "2024-01-01T11:00:00.000Z"
}
```

---

### Get Unread Count
**GET** `/unread`

Retrieves count of unread messages for current user.

**Response:** `200 OK`
```json
{
  "unreadCount": 5
}
```

---

### Get Messaged Users
**GET** `/users`

Retrieves list of all users with whom current user has exchanged messages.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "user_id",
      "username": "john_doe",
      "email": "john@example.com",
      "role": "developer",
      "lastMessage": {
        "content": "Last message content",
        "createdAt": "2024-01-01T10:00:00.000Z",
        "read": false
      }
    }
  ]
}
```

---

## Supported User Roles

Messages can be exchanged between all user types:
- Admin
- Manager
- Developer
- HR
- Client
- Digital Marketing
- Content Creator

---

## Real-time Features

### WebSocket Integration

Messages trigger real-time notifications via WebSocket:
```javascript
{
  type: 'newMessage',
  data: {
    _id: "...",
    content: "Message content",
    sender: { id: "...", role: "..." }
  }
}
```

### Typing Indicators

(Implementation specific - check WebSocket server for details)

---

## Error Handling

**404 Not Found:**
```json
{
  "message": "Message not found or unauthorized"
}
```

**400 Bad Request:**
```json
{
  "message": "Invalid message data"
}
```

**500 Server Error:**
```json
{
  "message": "Error sending message",
  "error": "Detailed error"
}
```

---

## Usage Examples

### Start a Conversation
```bash
POST /api/message/send
{
  "receiverId": "developer123",
  "receiverRole": "developer",
  "content": "Can we schedule a meeting?"
}
```

### Retrieve Chat History
```bash
GET /api/message/conversation/developer123
```

### Check Unread Messages
```bash
GET /api/message/unread
```

