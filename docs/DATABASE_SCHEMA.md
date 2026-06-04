# Database Schema Documentation

## Collections

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  matricule: String,
  department: String,
  level: Number,
  createdAt: Date,
  updatedAt: Date,
  preferences: {
    theme: "light" | "dark",
    timezone: String,
    notificationsEnabled: Boolean
  },
  productivityProfile: {
    morningPeakHours: [Number],
    afternoonPeakHours: [Number],
    eveningPeakHours: [Number],
    averageCompletionRate: Number
  }
}
```

### Tasks Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: Users),
  title: String,
  description: String,
  course: String,
  priority: "low" | "medium" | "high" | "urgent",
  difficulty: Number (1-10),
  estimatedDuration: Number (minutes),
  actualDuration: Number (minutes),
  dueDate: Date,
  completedDate: Date,
  status: "pending" | "in-progress" | "completed" | "overdue",
  tags: [String],
  subtasks: [
    {
      title: String,
      completed: Boolean,
      dueDate: Date
    }
  ],
  aiBuffer: Number (percentage),
  createdAt: Date,
  updatedAt: Date
}
```

### Sessions Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: Users),
  token: String,
  expiresAt: Date,
  deviceInfo: String,
  createdAt: Date
}
```

### Recommendations Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: Users),
  taskId: ObjectId (ref: Tasks),
  recommendationType: "reschedule" | "priority-adjustment" | "buffer-add",
  reason: String,
  suggestedTime: Date,
  accepted: Boolean,
  createdAt: Date
}
```

## Indexes

- `users.email` - Unique index
- `tasks.userId` - Index for faster queries
- `tasks.dueDate` - Index for sorting
- `sessions.token` - Unique index
- `recommendations.userId` - Index for queries
