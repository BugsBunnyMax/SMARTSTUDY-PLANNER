# API Documentation

## Authentication Endpoints

### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "student@buea.edu.cm",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "matricule": "CT23A095",
  "department": "Computer Engineering",
  "level": 400
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "student@buea.edu.cm",
    "firstName": "John"
  }
}
```

### POST /api/auth/login
Login user.

**Request Body:**
```json
{
  "email": "student@buea.edu.cm",
  "password": "securePassword123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": { ... }
}
```

## Task Endpoints

### GET /api/tasks
Get all tasks for the authenticated user.

**Query Parameters:**
- `status` - Filter by status (pending, in-progress, completed, overdue)
- `priority` - Filter by priority
- `startDate` - Filter by date range
- `endDate` - Filter by date range

**Response:** `200 OK`
```json
{
  "success": true,
  "tasks": [ ... ]
}
```

### POST /api/tasks
Create a new task.

**Request Body:**
```json
{
  "title": "Math Assignment",
  "description": "Chapter 5 exercises",
  "course": "MTH201",
  "priority": "high",
  "difficulty": 7,
  "estimatedDuration": 120,
  "dueDate": "2026-05-20T23:59:59Z",
  "tags": ["mathematics", "homework"]
}
```

**Response:** `201 Created`

### GET /api/tasks/:taskId
Get a specific task.

**Response:** `200 OK`

### PUT /api/tasks/:taskId
Update a task.

**Response:** `200 OK`

### DELETE /api/tasks/:taskId
Delete a task.

**Response:** `204 No Content`

## Recommendations Endpoints

### GET /api/recommendations
Get AI recommendations for the user.

**Response:** `200 OK`
```json
{
  "success": true,
  "recommendations": [
    {
      "id": "rec_id",
      "type": "reschedule",
      "reason": "Overdue task detected",
      "suggestedTime": "2026-05-15T14:00:00Z"
    }
  ]
}
```

### POST /api/recommendations/:recId/accept
Accept a recommendation.

**Response:** `200 OK`

### POST /api/recommendations/:recId/reject
Reject a recommendation.

**Response:** `200 OK`

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [ ... ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```
