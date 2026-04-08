# 🚀 User Registration Quick Start Guide

Get the registration system running in 5 minutes!

---

## ⚡ Quick Setup (First Time Only)

### 1️⃣ Check Database Configuration

Open `.env` - should have this line:

```bash
DATABASE_URL=postgresql://neondb_owner:npg_atMGxAlYC61y@ep-dry-star-a1g1acfh-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

✅ Already there? Great! Skip to step 2.

---

### 2️⃣ Generate Migrations (Creates Tables)

```bash
npm run drizzle:generate
```

You'll see:
```
✓ Generated migration: src/db/migrations/0000_lazy_*.sql
```

---

### 3️⃣ Apply Migrations (Adds Tables to Database)

```bash
npm run drizzle:push
```

You'll see:
```
✓ Applying migrations...
✓ Applied migrations successfully!
```

---

## ▶️ Running the System

### Terminal 1: Start Server

```bash
npm run dev
```

Wait for this message:
```
✅ Connected to Neon PostgreSQL database
HTTP Server has been started! at port: 8000
```

✅ Server is running!

---

### Terminal 2: Open Database UI (Optional)

```bash
npm run drizzle:studio
```

Then open: **http://localhost:5555**

You'll see a visual interface to view/manage your database.

---

## 🧪 Test Registration

### Option A: Using cURL (Command Line)

Open **Terminal 3** and run:

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "age": 28
  }'
```

**You'll see:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "age": 28,
    "createdAt": "2024-04-07T14:30:45.123Z"
  },
  "message": "New user has been saved successfully!"
}
```

✅ User registered!

---

### Option B: Using VSCode REST Client

1. **Install VSCode Extension:**
   - Open VSCode
   - Extensions → Search "REST Client"
   - Install by Huachao Mao

2. **Use test file:**
   - Open `test-registration.rest` in VSCode
   - Click "Send Request" above any test

3. **View response** in side panel

---

### Option C: Using Postman

1. **Open Postman** (or [postman.com](https://postman.com))

2. **Create Request:**
   - Method: `POST`
   - URL: `http://localhost:8000/api/v1/auth/register`

3. **Headers:**
   - `Content-Type: application/json`

4. **Body (raw JSON):**
   ```json
   {
     "name": "John Doe",
     "email": "john@example.com",
     "age": 28
   }
   ```

5. **Click Send**

---

## 🔍 Verify Data in Database

### Visual Way (Recommended)

1. **Already running:** `npm run drizzle:studio`
2. **Open:** http://localhost:5555
3. **Click:** "users" table in left sidebar
4. **See:** All registered users

---

### Command Line Way

If you have PostgreSQL installed:

```bash
psql "postgresql://neondb_owner:password@host/neondb"
```

Then:
```sql
SELECT * FROM users;
```

---

### Web Dashboard Way

1. Go to https://console.neon.tech
2. Select your project
3. SQL Editor
4. Run:
```sql
SELECT * FROM users;
```

---

## 📊 What Happens Behind the Scenes

```
Your Request
    ↓
Express Server (port 8000)
    ↓
authRouter routes to registerNewUser
    ↓
authController validates data
    ↓
Users class creates in database
    ↓
Drizzle ORM inserts into users table
    ↓
PostgreSQL (Neon) stores data
    ↓
Response sent back to you
```

---

## ✅ Quick Checklist

- [ ] `.env` has DATABASE_URL
- [ ] Ran `npm run drizzle:generate`
- [ ] Ran `npm run drizzle:push`
- [ ] Server running: `npm run dev`
- [ ] Can see ✅ "Connected to database" message
- [ ] Registered a user via cURL/Postman/REST Client
- [ ] Saw successful response with user data
- [ ] Opened Drizzle Studio and saw user in database

---

## ❌ Common Issues & Fixes

### "Cannot POST /api/v1/auth/register"

**Fix:**
- Make sure server is running: `npm run dev`
- Check URL is exactly: `http://localhost:8000/api/v1/auth/register`

---

### "Database connection refused"

**Fix:**
- Check `.env` DATABASE_URL is correct
- Verify Neon project is active
- Run migrations: `npm run drizzle:push`

---

### "User with this email already exists!"

**This is correct!** It means:
- Database is working
- User was already registered with that email
- Use different email: `alice@example.com` instead of `john@example.com`

---

### Can't see users in Drizzle Studio

**Fix:**
1. Make sure server is running: `npm run dev`
2. Make sure Studio is running: `npm run drizzle:studio`
3. Refresh browser: F5
4. Check migrations were applied: `npm run drizzle:push`

---

## 📚 Full Documentation

For detailed explanations, read:
- **Main Guide:** `tutorials/postgres_drizzle/05_USER_REGISTRATION_FLOW.md`
- **Setup Guide:** `tutorials/postgres_drizzle/00_GETTING_STARTED.md`
- **API Testing:** `test-registration.rest`

---

## 🎯 Next Features to Add

After registration works, add:

- ✅ Email validation
- ✅ Password hashing
- ✅ Login verification
- ✅ Refresh token storage
- ✅ User profile routes
- ✅ Update user info
- ✅ Delete user account

---

## 🆘 Need Help?

1. Check error message carefully - it tells you what's wrong
2. Read `tutorials/postgres_drizzle/05_USER_REGISTRATION_FLOW.md`
3. Check Drizzle Studio to see what's in database
4. Check server logs for errors

---

## 🎉 You're All Set!

Your registration system is production-ready:
- ✅ Data persists in database
- ✅ Validation built-in
- ✅ Error handling in place
- ✅ Easy to test and debug
- ✅ Scales to thousands of users

Happy coding! 🚀
