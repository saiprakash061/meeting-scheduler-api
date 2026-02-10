## Demo Video
[Click here to watch the demo](https://drive.google.com/file/d/1bYTVSwSIX1BiRWKoeJTpKVVdu3JgP3w5/view?usp=sharing)

# Meeting Scheduler API

A Node.js backend for scheduling meetings with conflict detection. Built using Express and MongoDB.

## Features
- Prevent overlapping meetings (Conflict Logic)
- User and Meeting CRUD
- JWT Authentication
- Soft delete for all records
- Request logging & Rate limiting
- Pagination (limit defaults to 1)

## Tech Stack
- Node.js / Express
- MongoDB / Mongoose
- Winston (Logging)
- JWT

## Project Folder Structure
The project uses a modular design to keep things organized:
- `src/config`: App and DB settings
- `src/modules/meeting`: All core logic (Controllers, Services, Models)
- `src/middlewares`: Auth and error handling
- `src/utils`: Common helpers

## Setup
1. Clone the repo and run `npm install`.
2. Set up your `.env`:
   ```env
   PORT=5002
   MONGODB_URI=mongodb://localhost:27017/meeting_scheduler
   JWT_SECRET=mysecretkey
   ```
3. Run with `npm run dev`.

## How the Conflict Check Works
The API checks if a user's new meeting overlaps with an existing one using this logic:
`(startTime < existing.endTime) && (endTime > existing.startTime)`

If there's a conflict, it returns a 400 error so the user can't double-book.


---
Created by [ch.sai prakash]
