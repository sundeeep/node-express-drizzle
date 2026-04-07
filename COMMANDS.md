# 🔧 All Commands Reference

Copy-paste ready commands for every step of the registration system.

---

## 📋 First Time Setup

### Step 1: Generate Database Tables

```bash
npm run drizzle:generate
```

**Expected Output:**
```
✓ Generated migration: src/db/migrations/0000_lazy_*.sql
```

---

### Step 2: Apply Tables to Database

```bash
npm run drizzle:push
```

**Expected Output:**
```
✓ Applying migrations...
✓ Applied migrations successfully!
```

---

### Step 3: Start Server

Open **Terminal 1**:

```bash
npm run dev
```

**Expected Output:**
```
✅ Connected to Neon PostgreSQL database
HTTP Server has been started! at port: 8000
```

✅ **Server is running!** Keep this terminal open.

---

## 🧪 Testing Registration

Open **Terminal 2** and test the registration:

### Test 1: Register First User

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "age": 28
  }'
```

**Expected Response:**
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

---

### Test 2: Register Another User

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Smith",
    "email": "alice@example.com",
    "age": 25
  }'
```

**Expected Response:**
Same as above but with id: 2, Alice's name and email.

---

### Test 3: Try Duplicate Email (Should Fail)

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Different Name",
    "email": "john@example.com",
    "age": 35
  }'
```

**Expected Response (400):**
```json
{
  "success": false,
  "error": "User with this email already exists!",
  "message": "User with this email already exists!"
}
```

✅ This error means database is working correctly!

---

### Test 4: Try Missing Email (Should Fail)

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bob Johnson"
  }'
```

**Expected Response (400):**
```json
{
  "success": false,
  "error": "Name and email are required!",
  "message": "Name and email are required!"
}
```

---

## 🔍 Checking Database Data

### Open Visual Database UI

Open **Terminal 3**:

```bash
npm run drizzle:studio
```

Then open in browser:
```
http://localhost:5555
```

**What you'll see:**
- Left sidebar: List of tables
- Click "users" table
- See all registered users with their data

---

## 🔐 Login Testing

### Test Login with Registered User

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "loggedInUserData": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "age": 28,
      "createdAt": "..."
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### Test Login with Non-Existent User

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com"
  }'
```

**Expected Response (400):**
```json
{
  "success": false,
  "error": "Email is wrong or User not found!",
  "message": "Email is wrong or User not found!"
}
```

---

## 🔄 Schema Management

### View Schema File

```bash
cat src/db/schema.js
```

### View Generated Migration SQL

```bash
cat src/db/migrations/0000_lazy_*.sql
```

(Replace * with actual filename)

### View Migration History

```bash
cat src/db/migrations/meta/_journal.json
```

---

## ⚙️ Drizzle Commands

### Generate Migrations (After Schema Changes)

```bash
npm run drizzle:generate
```

### Apply Migrations to Database

```bash
npm run drizzle:push
```

### Open Visual Database Manager

```bash
npm run drizzle:studio
```

### Drop All Data (⚠️ DANGEROUS!)

```bash
npm run drizzle:drop
```

**Warning:** This deletes ALL data! Only use if you want to reset.

---

## 🚀 Server Commands

### Start Development Server (With Auto-Reload)

```bash
npm run dev
```

### Start Production Server

```bash
npm start
```

### Stop Server

Press `Ctrl + C` in the terminal

---

## 📝 Quick Copy-Paste Flow

**Terminal 1:**
```bash
npm run drizzle:generate
npm run drizzle:push
npm run dev
```

**Terminal 2:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","age":28}'
```

**Terminal 3:**
```bash
npm run drizzle:studio
# Open http://localhost:5555 in browser
```

---

## 🧪 Full Test Suite (Copy-Paste Everything)

```bash
# Terminal 1: Setup and start
npm run drizzle:generate
npm run drizzle:push
npm run dev

# Open Terminal 2 and run these one by one:

# Test 1: Register user 1
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","age":28}'

# Test 2: Register user 2
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice Smith","email":"alice@example.com","age":25}'

# Test 3: Register user 3
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Bob Johnson","email":"bob@example.com","age":30}'

# Test 4: Duplicate email (should fail)
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Duplicate","email":"john@example.com"}'

# Test 5: Missing email (should fail)
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"No Email"}'

# Test 6: Login successful
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com"}'

# Test 7: Health check
curl http://localhost:8000/health

# Terminal 3: View database
npm run drizzle:studio
# Open http://localhost:5555 in browser
```

---

## 📊 Verify Everything Works

- [ ] `npm run drizzle:generate` - Succeeds
- [ ] `npm run drizzle:push` - Succeeds  
- [ ] `npm run dev` - Server starts with ✅ message
- [ ] First registration - Returns 201 with user id
- [ ] Second registration - Returns 201 with user id 2
- [ ] Duplicate email - Returns 400 error
- [ ] Missing email - Returns 400 error
- [ ] Login - Returns 200 with access token
- [ ] Drizzle Studio - Shows all 3 users in table

---

## 🆘 Quick Troubleshooting Commands

### Check if port 8000 is in use

```bash
lsof -i :8000
```

### Kill process using port 8000

```bash
kill -9 <PID>
```

### Check npm packages are installed

```bash
npm list drizzle-orm drizzle-kit pg
```

### Reinstall dependencies

```bash
npm install
```

### Check Node version

```bash
node -v
```

Should be v18 or higher.

### View .env file

```bash
cat .env
```

### View recent commits

```bash
git log --oneline -5
```

---

## 📱 Using Postman Instead of cURL

1. **Download Postman** from https://postman.com
2. **Create Request:**
   - Method: POST
   - URL: `http://localhost:8000/api/v1/auth/register`
3. **Headers Tab:**
   - Key: `Content-Type`
   - Value: `application/json`
4. **Body Tab → Raw → JSON:**
   ```json
   {
     "name": "John Doe",
     "email": "john@example.com",
     "age": 28
   }
   ```
5. **Click Send**
6. **See Response** below

---

## 🔗 API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login user |
| GET | `/api/v1/auth/refresh` | Refresh token |
| GET | `/health` | Check server status |

---

## 📚 Related Documentation

- **START_HERE.md** - Begin here
- **REGISTRATION_QUICK_START.md** - 5-minute setup
- **FLOW_DIAGRAM.md** - Visual breakdown
- **tutorials/postgres_drizzle/05_USER_REGISTRATION_FLOW.md** - Complete guide

---

## ✅ You're Ready!

All commands are here. Just copy-paste and run them in order!

Happy coding! 🚀
