# API Testing Guide

This document provides comprehensive examples for testing all API endpoints.

## Base URL
```
http://localhost:3000
```

## 1. Health Check

### Check Server Status
```bash
curl http://localhost:3000/health
```

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-02-10T10:20:34.000Z"
}
```

## 2. User Management

### Create User
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "password": "password123",
    "timezone": "America/New_York"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "timezone": "America/New_York",
    "createdAt": "2026-02-10T10:20:34.000Z",
    "updatedAt": "2026-02-10T10:20:34.000Z"
  }
}
```

### Get User by ID
```bash
curl http://localhost:3000/api/users/550e8400-e29b-41d4-a716-446655440000
```

### Get All Users (with pagination)
```bash
curl "http://localhost:3000/api/users?page=1&limit=10"
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

## 3. Authentication

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "timezone": "America/New_York"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Get Current User (Protected Route)
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 4. Meeting Management

### Create Meeting
```bash
curl -X POST http://localhost:3000/api/meetings \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Team Standup",
    "description": "Daily team synchronization meeting",
    "startTime": "2026-02-11T10:00:00Z",
    "endTime": "2026-02-11T10:30:00Z",
    "location": "Conference Room A",
    "attendees": ["bob@example.com", "carol@example.com"]
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Meeting created successfully",
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Team Standup",
    "description": "Daily team synchronization meeting",
    "startTime": "2026-02-11T10:00:00.000Z",
    "endTime": "2026-02-11T10:30:00.000Z",
    "location": "Conference Room A",
    "attendees": ["bob@example.com", "carol@example.com"],
    "status": "scheduled",
    "createdAt": "2026-02-10T10:20:34.000Z",
    "updatedAt": "2026-02-10T10:20:34.000Z"
  }
}
```

### Get Meeting by ID
```bash
curl http://localhost:3000/api/meetings/660e8400-e29b-41d4-a716-446655440000
```

### List All Meetings
```bash
curl "http://localhost:3000/api/meetings?page=1&limit=10"
```

### List Meetings with Filters

**By User:**
```bash
curl "http://localhost:3000/api/meetings?userId=550e8400-e29b-41d4-a716-446655440000&page=1&limit=10"
```

**By Date Range:**
```bash
curl "http://localhost:3000/api/meetings?startDate=2026-02-10&endDate=2026-02-15"
```

**By Status:**
```bash
curl "http://localhost:3000/api/meetings?status=scheduled"
```

**Combined Filters:**
```bash
curl "http://localhost:3000/api/meetings?userId=550e8400-e29b-41d4-a716-446655440000&status=scheduled&startDate=2026-02-10&page=1&limit=10"
```

### Update Meeting
```bash
curl -X PUT http://localhost:3000/api/meetings/660e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Team Standup",
    "startTime": "2026-02-11T11:00:00Z",
    "endTime": "2026-02-11T11:30:00Z"
  }'
```

### Update Meeting Status
```bash
curl -X PUT http://localhost:3000/api/meetings/660e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed"
  }'
```

### Delete Meeting (Soft Delete)
```bash
curl -X DELETE http://localhost:3000/api/meetings/660e8400-e29b-41d4-a716-446655440000
```

## 5. Conflict Detection Testing

### Test 1: Create Two Overlapping Meetings

**First Meeting (10:00 - 11:00):**
```bash
curl -X POST http://localhost:3000/api/meetings \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "title": "First Meeting",
    "startTime": "2026-02-11T10:00:00Z",
    "endTime": "2026-02-11T11:00:00Z"
  }'
```

**Second Meeting (10:30 - 11:30) - Should FAIL:**
```bash
curl -X POST http://localhost:3000/api/meetings \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Second Meeting",
    "startTime": "2026-02-11T10:30:00Z",
    "endTime": "2026-02-11T11:30:00Z"
  }'
```

**Expected Error Response:**
```json
{
  "success": false,
  "error": "Time slot already booked. Conflict with meeting: 'First Meeting' (2026-02-11T10:00:00.000Z - 2026-02-11T11:00:00.000Z)"
}
```

### Test 2: Non-Overlapping Meetings (Should Succeed)

**Third Meeting (11:00 - 12:00) - Should SUCCEED:**
```bash
curl -X POST http://localhost:3000/api/meetings \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Third Meeting",
    "startTime": "2026-02-11T11:00:00Z",
    "endTime": "2026-02-11T12:00:00Z"
  }'
```

### Test 3: Edge Cases

**Meeting ending exactly when another starts (Should SUCCEED):**
```bash
# Meeting A: 09:00 - 10:00
curl -X POST http://localhost:3000/api/meetings \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Meeting A",
    "startTime": "2026-02-12T09:00:00Z",
    "endTime": "2026-02-12T10:00:00Z"
  }'

# Meeting B: 10:00 - 11:00 (Should succeed - no overlap)
curl -X POST http://localhost:3000/api/meetings \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Meeting B",
    "startTime": "2026-02-12T10:00:00Z",
    "endTime": "2026-02-12T11:00:00Z"
  }'
```

## 6. Validation Testing

### Invalid Email
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "invalid-email",
    "password": "password123"
  }'
```

**Expected Error:**
```json
{
  "success": false,
  "error": "Valid email is required"
}
```

### Invalid Time Range (End before Start)
```bash
curl -X POST http://localhost:3000/api/meetings \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Invalid Meeting",
    "startTime": "2026-02-11T11:00:00Z",
    "endTime": "2026-02-11T10:00:00Z"
  }'
```

**Expected Error:**
```json
{
  "success": false,
  "error": "End time must be after start time"
}
```

### Meeting in the Past
```bash
curl -X POST http://localhost:3000/api/meetings \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Past Meeting",
    "startTime": "2020-01-01T10:00:00Z",
    "endTime": "2020-01-01T11:00:00Z"
  }'
```

**Expected Error:**
```json
{
  "success": false,
  "error": "Cannot schedule meetings in the past"
}
```

## 7. Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "No token provided. Access denied"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Meeting not found"
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "error": "Too many requests from this IP, please try again later"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal Server Error"
}
```

## 8. Using Postman

You can import these examples into Postman:

1. Create a new Collection named "Meeting Scheduler API"
2. Add environment variables:
   - `base_url`: `http://localhost:3000`
   - `token`: (will be set after login)
3. Create requests for each endpoint
4. Use `{{base_url}}` and `{{token}}` in your requests

## 9. Testing Workflow

1. **Create a user** → Get user ID
2. **Login** → Get JWT token
3. **Create meetings** for that user
4. **Test conflict detection** by creating overlapping meetings
5. **List meetings** with various filters
6. **Update a meeting** and verify no conflicts
7. **Delete a meeting**

---

**Happy Testing! 🚀**
