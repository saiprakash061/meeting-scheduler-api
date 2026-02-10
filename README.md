# 📅 Meeting Scheduler API

A professional backend service for managing calendar bookings with **automated conflict detection**. Built with **Node.js**, **Express**, and **MongoDB**.

## 🚀 Key Features

*   **Conflict Detection Logic**: Prevents overlapping meetings for the same user.
*   **Modular Architecture**: Clean separation between Controllers, Services, and Models.
*   **Data Validation**: Strict DTO enforcement for all incoming requests.
*   **Production Ready**: Includes Rate Limiting, JWT Auth, Soft Deletes, and logging.
*   **Optimized Database**: Indexed MongoDB queries for fast booking checks.

## 🛠️ Tech Stack

*   **Runtime**: Node.js / Express
*   **Database**: MongoDB / Mongoose
*   **Security**: JWT, Helmet, Rate Limiter
*   **Logging**: Winston (Combined & Error logs)

## 📁 Required Structure

```text
src/
├── config/         # App & DB Config
├── middlewares/    # Error/Auth/Limiters
├── modules/
│   └── meeting/    # Encapsulated Logic
│       ├── dto/    # Validation Schemas
│       ├── index/  # Module Entry
│       ├── interface/# Controllers
│       ├── model/  # DB Schemas
│       └── service/# Business Rules
└── utils/          # Logger & Helpers
```

## 🚥 Quick Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   Create a `.env` file in the root:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/meeting_scheduler
   JWT_SECRET=your_secret_key
   ```

3. **Start the Service**:
   ```bash
   npm run dev
   ```

## 📡 API Endpoints

### 👤 Users
*   `POST /api/users` - Register
*   `GET /api/users/:id` - Profile

### 🗓️ Meetings
*   `POST /api/meetings` - Book Meeting
*   `GET /api/meetings` - List (Supports filters: `userId`, `startDate`, `endDate`)
*   `GET /api/meetings/:id` - Details
*   `PUT /api/meetings/:id` - Update
*   `DELETE /api/meetings/:id` - Remove (Soft Delete)

### 🔐 Auth
*   `POST /api/auth/login` - Login

## 🧠 Business Rule: Conflict Prevention

The core logic validates time slots before saving:
> **Overlap Condition**: `(Existing Start < New End) AND (Existing End > New Start)`

If a collision is detected, the API returns a `400 Bad Request` with details about the conflicting meeting.

---
🚀 *Happy Scheduling!*
