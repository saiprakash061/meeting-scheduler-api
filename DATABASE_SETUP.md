# Database Setup

**This project now uses MongoDB.**

Please refer to `MONGODB_SETUP.md` for detailed instructions on setting up your database connection.

## Quick Summary

1. Install MongoDB Community Edition
2. Start MongoDB service (`mongod`)
3. Ensure it's running on port `27017`
4. Update `.env` with:
   ```env
   MONGODB_URI=mongodb://localhost:27017/meeting_scheduler
   ```
