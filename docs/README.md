# Project Management API Documentation

This comprehensive documentation covers all the APIs in the Project Management system backend. The system is built using Node.js, Express, and MongoDB, and supports multiple user roles with different permissions and capabilities.

## Table of Contents

1. [Admin APIs](admin-apis.md)
2. [Manager APIs](manager-apis.md)
3. [Developer APIs](developer-apis.md)
4. [HR APIs](hr-apis.md)
5. [Client APIs](client-apis.md)
6. [Digital Marketing APIs](digital-marketing-apis.md)
7. [Content Creator APIs](content-creator-apis.md)
8. [Candidate Management APIs](candidate-apis.md)
9. [Job Management APIs](job-apis.md)
10. [Interview APIs](interview-apis.md)
11. [Offer Letter APIs](offer-letter-apis.md)
12. [Message APIs](message-apis.md)
13. [Payslip APIs](payslip-apis.md)
14. [Calendar & Events APIs](calendar-apis.md)
15. [Project APIs](project-apis.md)
16. [Task APIs](task-apis.md)
17. [Marketing Task APIs](marketing-task-apis.md)
18. [Revenue APIs](revenue-apis.md)

## Base URL

```
http://localhost:4000
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-token>
```

## User Roles

The system supports the following user roles:
- **Admin**: Full system access and management
- **Manager**: Team and project management
- **Developer**: Project and task execution
- **HR**: Human resources and employee management
- **Client**: Project tracking and communication
- **Digital Marketing**: Marketing task and campaign management
- **Content Creator**: Content creation and management

## Common Features

### File Uploads
File uploads are handled using Multer and Cloudinary for cloud storage. Common file fields:
- Profile images
- Company logos
- Resumes
- Project documents
- Task attachments
- Marketing materials

### Notifications
The system includes a comprehensive notification system for:
- Project assignments
- Task updates
- Holiday approvals
- Team member additions
- Calendar events
- Message alerts

### Email Notifications
Email notifications are sent for:
- Project assignments
- Task assignments
- Interview scheduling
- Offer letters
- Payslip generation
- Calendar events

## Error Responses

All APIs follow a consistent error response format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Success Responses

Standard success response format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

## Technology Stack

- **Backend Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary
- **Email Service**: Nodemailer
- **PDF Generation**: PDFKit
- **Real-time**: WebSockets (ws library)

## Getting Started

1. Ensure MongoDB is running
2. Install dependencies: `npm install`
3. Configure environment variables in `.env`
4. Start the server: `node index.js`
5. Access the API at `http://localhost:4000`

## Environment Variables

Required environment variables:
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `PORT`: Server port (default: 4000)
- Cloudinary credentials (for file uploads)
- Email service credentials (for notifications)

## Support

For issues or questions, please refer to the specific API documentation or contact the development team.

