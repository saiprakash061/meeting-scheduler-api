# 🔗 MongoDB Connection Setup

The application has been converted to use MongoDB instead of PostgreSQL.

## Option 1: MongoDB Atlas (Cloud - Recommended)

### Step 1: Get Your Connection String

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign in or create a free account
3. Create a new cluster (or use existing)
4. Click "Connect" → "Connect your application"
5. Copy the connection string (it looks like this):
   ```
   mongodb+srv://username:password@cluster.mongodb.net/meeting_scheduler
   ```

### Step 2: Update .env File

Open `.env` and replace the `MONGODB_URI`:

```env
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/meeting_scheduler
```

**Important:** Replace:
- `YOUR_USERNAME` - Your MongoDB Atlas username
- `YOUR_PASSWORD` - Your MongoDB Atlas password
- `YOUR_CLUSTER` - Your cluster name

### Step 3: Run the Application

```powershell
cd C:\Users\saisu\.gemini\antigravity\scratch\meeting-scheduler-api\meeting-scheduler-api
npm run dev
```

---

## Option 2: Local MongoDB

### Step 1: Install MongoDB Locally

1. Download from: https://www.mongodb.com/try/download/community
2. Install with default settings
3. MongoDB will run on `localhost:27017`

### Step 2: .env Configuration

The `.env` file is already configured for local MongoDB:

```env
MONGODB_URI=mongodb://localhost:27017/meeting_scheduler
```

### Step 3: Run the Application

```powershell
cd C:\Users\saisu\.gemini\antigravity\scratch\meeting-scheduler-api\meeting-scheduler-api
npm run dev
```

---

## Quick Test

After starting the server, test it:

```bash
# Health check
curl http://localhost:3000/health

# Should return:
{
  "success": true,
  "message": "Server is running",
  "timestamp": "..."
}
```

---

## What Changed?

✅ **Switched from PostgreSQL to MongoDB**
- Sequelize ORM → Mongoose ODM
- SQL queries → MongoDB queries
- PostgreSQL → MongoDB

✅ **All Features Preserved**
- ✓ User management
- ✓ Meeting CRUD
- ✓ **Conflict detection** (same formula!)
- ✓ JWT authentication
- ✓ Pagination
- ✓ Soft delete
- ✓ Validation

✅ **MongoDB Benefits**
- No local database installation needed (use Atlas)
- Flexible schema
- Easy scaling
- Free tier available

---

## Need Help?

If you have a MongoDB Atlas connection string, I can update the `.env` file for you. Just provide:

```
mongodb+srv://username:password@cluster.mongodb.net/meeting_scheduler
```
