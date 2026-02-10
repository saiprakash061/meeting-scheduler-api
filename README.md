# Meeting Scheduler API

A robust backend service for scheduling meetings with automatic conflict detection, built with Node.js, Express, and **MongoDB**.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **ODM**: Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Custom DTOs
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate Limiting

## Features

✅ User Management (CRUD)  
✅ Meeting Management (CRUD)  
✅ **Conflict Detection** (Time overlap prevention)  
✅ **MongoDB Integration**  
✅ JWT Authentication  
✅ Pagination  
✅ Soft Delete  
✅ Request Logging  
✅ Rate Limiting

## Project Structure

```
src/
├── config/         # Database and app configuration
├── middlewares/    # Error handling, Auth, Rate limiting
├── modules/        # Feature modules (User, Meeting)
│   ├── dto/        # Data Transfer Objects
│   ├── interface/  # Controllers
│   ├── model/      # Mongoose Models
│   ├── routes/     # Express Routes
│   └── service/    # Business Logic
└── utils/          # Logger, Async wrapper
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` (or use the existing `.env`):

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/meeting_scheduler
JWT_SECRET=your_secret_key_here
```

### 3. Run the Server

```bash
# Development
npm run dev

# Production
npm start
```

Server will start on: `http://localhost:5000`

## Database

This project uses **MongoDB**. You can run it locally or use MongoDB Atlas.

- **Local**: Ensure MongoDB service is running on `localhost:27017`
- **Atlas**: Update `MONGODB_URI` in `.env` with your connection string

## API Endpoints

### Health Check
`GET /health`

### User Management
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user by ID
- `GET /api/users` - Get all users (paginated)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Meeting Management
- `POST /api/meetings` - Create meeting
- `GET /api/meetings/:id` - Get meeting by ID
- `GET /api/meetings` - List meetings (filters: userId, startDate, endDate, status)
- `PUT /api/meetings/:id` - Update meeting
- `DELETE /api/meetings/:id` - Delete meeting

### Authentication
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

## Business Logic: Conflict Detection

The system ensures **no overlapping meetings** for the same user.
Conflict Formula: `existing.start < new.end AND existing.end > new.start`

If a meeting overlaps with an existing one, the API returns `400 Bad Request`.

## License

MIT
