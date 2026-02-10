# Architecture Documentation

## Overview

This project follows **Clean Architecture** principles with clear separation of concerns across multiple layers.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│              (Routes, Controllers/Interface)                │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   Application Layer                         │
│                  (Services, DTOs)                           │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    Domain Layer                             │
│                     (Models)                                │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                Infrastructure Layer                         │
│              (Database, Config, Utils)                      │
└─────────────────────────────────────────────────────────────┘
```

## Layer Responsibilities

### 1. Presentation Layer (`interface/`, `routes/`)

**Purpose**: Handle HTTP requests and responses

**Components**:
- **Controllers** (`interface/`): Handle incoming requests, validate input, call services
- **Routes** (`routes/`): Define API endpoints and map them to controllers

**Rules**:
- Controllers should be thin (no business logic)
- Only handle HTTP-specific concerns
- Delegate to services for business logic

### 2. Application Layer (`service/`, `dto/`)

**Purpose**: Implement business logic and use cases

**Components**:
- **Services** (`service/`): Core business logic, orchestration
- **DTOs** (`dto/`): Data validation and transformation

**Rules**:
- Services contain all business logic
- DTOs validate and transform data
- Services are framework-agnostic (pure JavaScript)

### 3. Domain Layer (`model/`)

**Purpose**: Define domain entities and their relationships

**Components**:
- **Models** (`model/`): Sequelize models representing database tables

**Rules**:
- Models define structure and relationships
- Minimal business logic (only domain-specific validations)
- Database-agnostic as much as possible

### 4. Infrastructure Layer (`config/`, `utils/`, `middlewares/`)

**Purpose**: Provide technical capabilities to other layers

**Components**:
- **Config**: Application and database configuration
- **Utils**: Reusable utilities (logger, error handling, async)
- **Middlewares**: Cross-cutting concerns (auth, error handling, rate limiting)

## Data Flow

### Request Flow (Create Meeting)

```
1. Client Request
   ↓
2. Express Route (/api/meetings)
   ↓
3. Rate Limiting Middleware
   ↓
4. Meeting Controller (createMeeting)
   ↓
5. Meeting Service
   ├→ CreateMeetingDTO (validation)
   ├→ User Model (verify user exists)
   ├→ Conflict Detection Logic
   └→ Meeting Model (create)
   ↓
6. MeetingResponseDTO (format response)
   ↓
7. Controller sends response
   ↓
8. Client receives response
```

### Conflict Detection Flow

```
1. Service receives meeting data
   ↓
2. CreateMeetingDTO validates input
   ↓
3. Service calls checkTimeConflict()
   ↓
4. Database query with WHERE clause:
   - userId = newMeeting.userId
   - status != 'cancelled'
   - startTime < newMeeting.endTime
   - endTime > newMeeting.startTime
   ↓
5. If conflict found:
   ├→ Throw AppError with conflict details
   └→ Error Middleware handles response
   ↓
6. If no conflict:
   └→ Create meeting in database
```

## Key Design Patterns

### 1. Repository Pattern
Models act as repositories for data access.

### 2. DTO Pattern
Data Transfer Objects for validation and transformation.

### 3. Service Pattern
Business logic encapsulated in service classes.

### 4. Middleware Pattern
Cross-cutting concerns handled by Express middleware.

### 5. Singleton Pattern
Services are exported as singletons (`new ServiceClass()`).

## Database Schema Design

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  timezone VARCHAR(50) DEFAULT 'UTC',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_users_email ON users(email);
```

### Meetings Table
```sql
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  location VARCHAR(255),
  attendees TEXT[], -- PostgreSQL array
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP NULL,
  
  CONSTRAINT check_end_after_start CHECK (end_time > start_time)
);

-- Indexes for performance
CREATE INDEX idx_meetings_user_id ON meetings(user_id);
CREATE INDEX idx_meetings_time_range ON meetings(start_time, end_time);
CREATE INDEX idx_meetings_status ON meetings(status);
CREATE INDEX idx_meetings_user_time ON meetings(user_id, start_time, end_time);
```

## Conflict Detection Algorithm

The conflict detection uses the **interval overlap** algorithm:

```javascript
// Two time intervals overlap if:
// existing.start < new.end AND existing.end > new.start

const conflictExists = (existing, newMeeting) => {
  return existing.startTime < newMeeting.endTime &&
         existing.endTime > newMeeting.startTime;
};
```

### Visual Examples

**Case 1: Overlap (CONFLICT)**
```
Existing:  [--------]
New:           [--------]
           ^^^^^ Overlap
```

**Case 2: No Overlap (OK)**
```
Existing:  [--------]
New:                  [--------]
           No overlap
```

**Case 3: Edge Case (OK)**
```
Existing:  [--------]
New:                [--------]
           No overlap (end = start is allowed)
```

## Security Architecture

### 1. Authentication Flow

```
1. User sends credentials to /api/auth/login
   ↓
2. AuthService validates credentials
   ↓
3. Password compared with bcrypt
   ↓
4. If valid, generate JWT token
   ↓
5. Return token to client
   ↓
6. Client includes token in Authorization header
   ↓
7. Auth Middleware verifies token
   ↓
8. User object attached to req.user
```

### 2. Password Security
- Passwords hashed with bcrypt (10 salt rounds)
- Never stored or transmitted in plain text
- Hashing happens in Sequelize hooks (beforeCreate, beforeUpdate)

### 3. JWT Security
- Tokens signed with secret key
- Expiration enforced (default: 24h)
- Token verification on protected routes

### 4. Rate Limiting
- General API: 100 requests / 15 minutes
- Auth endpoints: 5 requests / 15 minutes
- Prevents brute force attacks

## Error Handling Strategy

### Error Types

1. **Operational Errors** (AppError)
   - Expected errors (validation, not found, etc.)
   - Should be sent to client

2. **Programming Errors**
   - Unexpected errors (bugs)
   - Should be logged and generic message sent to client

### Error Flow

```
1. Error occurs in Service/Controller
   ↓
2. Throw AppError or let error propagate
   ↓
3. asyncHandler catches promise rejections
   ↓
4. Error Middleware receives error
   ↓
5. Middleware formats error response
   ├→ Development: Include stack trace
   └→ Production: Generic message only
   ↓
6. Response sent to client
```

## Logging Strategy

### Log Levels
- **error**: Errors that need attention
- **warn**: Warning messages
- **info**: General information (default)
- **http**: HTTP request logs
- **debug**: Debug information

### Log Destinations
- **Console**: All logs (colored in development)
- **combined.log**: All logs (file)
- **error.log**: Error logs only (file)

## Performance Optimizations

### 1. Database Indexes
- User email (unique constraint + index)
- Meeting user_id (foreign key index)
- Meeting time range (composite index)
- Meeting status (index for filtering)

### 2. Connection Pooling
```javascript
pool: {
  max: 5,      // Maximum connections
  min: 0,      // Minimum connections
  acquire: 30000,  // Max time to acquire connection
  idle: 10000  // Max idle time
}
```

### 3. Pagination
- Default limit: 10 items per page
- Prevents loading entire datasets

### 4. Soft Deletes
- Faster than hard deletes
- Data recovery possible
- No cascading delete overhead

## Testing Strategy

### Unit Tests (Recommended)
- Test individual functions/methods
- Mock dependencies
- Focus: Services, DTOs, Utilities

### Integration Tests (Recommended)
- Test API endpoints
- Use test database
- Focus: Routes + Controllers + Services

### Example Test Structure
```javascript
describe('MeetingService', () => {
  describe('checkTimeConflict', () => {
    it('should detect overlapping meetings', async () => {
      // Test conflict detection
    });
    
    it('should allow non-overlapping meetings', async () => {
      // Test no conflict
    });
  });
});
```

## Deployment Considerations

### Environment Variables
- Never commit `.env` file
- Use `.env.example` as template
- Set production values in deployment environment

### Database Migrations
- Use Sequelize migrations in production
- Never use `sync({ force: true })` in production
- Use `sync({ alter: true })` carefully

### Process Management
- Use PM2 or similar process manager
- Configure auto-restart on crash
- Enable cluster mode for scalability

### Monitoring
- Log to centralized logging service
- Monitor error rates
- Track API response times
- Set up alerts for critical errors

## Scalability Considerations

### Horizontal Scaling
- Stateless API (JWT tokens)
- Database connection pooling
- Load balancer compatible

### Caching (Future Enhancement)
- Cache user data with Redis
- Cache frequent queries
- Invalidate on updates

### Database Optimization
- Read replicas for scaling reads
- Partitioning for large meeting tables
- Archive old meetings

---

**This architecture provides a solid foundation for a production-ready meeting scheduler API with conflict detection.**
