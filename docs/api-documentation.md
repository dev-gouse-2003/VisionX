# CivicPulse AI — API Documentation

Base URL: `http://localhost:8000/api`

Interactive Docs: `http://localhost:8000/api/docs/` (Swagger UI)

---

## Authentication

All protected endpoints require:
```
Authorization: Bearer <access_token>
```

### POST /auth/login/
Login and get JWT tokens.

**Request:**
```json
{
  "email": "admin@civicpulse.gov",
  "password": "Admin@123"
}
```

**Response:**
```json
{
  "access": "eyJ...",
  "refresh": "eyJ...",
  "user": {
    "id": "uuid",
    "email": "admin@civicpulse.gov",
    "full_name": "Admin User",
    "role": "admin"
  }
}
```

### POST /auth/register/
Register a new citizen.

### POST /auth/logout/
Blacklist refresh token.

### POST /auth/refresh/
Get new access token using refresh token.

### GET /auth/profile/
Get current user profile.

---

## Complaints

### GET /complaints/
List complaints (filtered by user role).

**Query params:** `status`, `priority`, `category`, `district`, `search`, `page`

### POST /complaints/
Submit a new complaint (citizen only).

**Request (multipart/form-data):**
```
title: "Water pipe burst"
description: "Large water pipe burst near..."
category: "water"
district: "Mumbai"
state: "Maharashtra"
is_emergency: false
attachments: [file1, file2]
```

### GET /complaints/{id}/
Get complaint details.

### PATCH /complaints/{id}/
Update complaint status (officer/admin).

```json
{
  "status": "in_progress",
  "comment": "Team dispatched to location"
}
```

### GET /complaints/stats/
Get complaint statistics.

### GET /complaints/overdue/
Get overdue complaints.

### GET /complaints/emergency/
Get active emergency complaints.

### POST /complaints/{id}/escalate/
Escalate a complaint.

---

## AI Engine

### POST /ai/classify/
Classify complaint text.

**Request:**
```json
{ "text": "Water pipe burst near main road" }
```

**Response:**
```json
{
  "category": "water",
  "confidence": 0.92,
  "priority": "high",
  "sentiment": "urgent",
  "summary": "Water pipe burst causing disruption..."
}
```

### POST /ai/assistant/
Ask the AI Governance Assistant.

**Request:**
```json
{ "query": "Which department has highest delays?" }
```

**Response:**
```json
{
  "intent": "highest_delays",
  "query": "Which department has highest delays?",
  "answer": "🚨 **Roads & Infrastructure** has the highest delays...",
  "data": { "departments": [...] },
  "chart_type": "bar",
  "suggestions": ["Which officers are overloaded?", ...]
}
```

### GET /ai/assistant/
Get suggested questions.

### POST /ai/spam-detect/
Detect spam/duplicate complaints.

### POST /ai/predict-delay/
Predict complaint delay probability.

### POST /ai/sentiment/
Analyze text sentiment.

---

## Analytics

### GET /analytics/dashboard/
Get main dashboard data (KPIs, charts, trends).

### GET /analytics/monthly-trend/?months=6
Get monthly complaint trend.

### GET /analytics/departments/
Get department performance analytics.

### GET /analytics/heatmap/
Get district-wise complaint heatmap.

### GET /analytics/officers/
Get officer performance data.

### GET /analytics/transparency/
Get governance transparency index.

### GET /analytics/export/
Export complaints as CSV.

---

## Departments

### GET /departments/
List all departments.

### GET /departments/rankings/
Get department performance rankings.

### GET /departments/{id}/performance/
Get department performance history.

---

## Notifications

### GET /notifications/
Get user notifications.

### POST /notifications/mark_all_read/
Mark all notifications as read.

### GET /notifications/unread_count/
Get unread notification count.

---

## WebSocket

Connect to real-time notifications:
```
ws://localhost:8000/ws/notifications/
```

Messages:
- `{ type: "unread_count", count: 5 }` — on connect
- `{ type: "notification", notification: {...} }` — new notification
- Send `{ type: "mark_read" }` to mark all read

---

## Error Responses

```json
{
  "detail": "Authentication credentials were not provided."
}
```

HTTP Status Codes:
- `200` — Success
- `201` — Created
- `400` — Bad Request
- `401` — Unauthorized
- `403` — Forbidden
- `404` — Not Found
- `429` — Rate Limited
- `500` — Server Error
