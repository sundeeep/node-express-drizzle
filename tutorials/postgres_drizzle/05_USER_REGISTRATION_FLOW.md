# User Registration Flow with Database Integration

Complete step-by-step guide to understand and use the user registration system with PostgreSQL and Drizzle ORM.

---

## 📋 What You'll Learn

- How the registration flow works
- How requests flow from API → Controller → Database
- How to check data in the database
- How to use Drizzle Studio
- How to test the API
- How to debug issues

---

## 🎯 The Big Picture

### Registration Flow Diagram

```
User sends POST request to /api/v1/auth/register
                    ↓
         Express receives request
                    ↓
         authRouter routes to controller
                    ↓
    registerNewUser function in authController.js
                    ↓
    Validates data (name, email required)
                    ↓
    Checks if user already exists (via Users.js)
                    ↓
    Users.js.createNewUser() 
                    ↓
    Drizzle ORM inserts into database
                    ↓
    PostgreSQL stores in 'users' table
                    ↓
    Returns created user to controller
                    ↓
    Controller returns JSON response
                    ↓
    User receives HTTP 201 with user data
```

---


## 📂 Project Structure (What You Have)

```
src/
├── index.js                           ← Server entry point
├── controllers/
│   └── authController.js              ← Business logic
├── routers/
│   └── authRouter.js                  ← Route definitions
├── db/
│   ├── index.js                       ← Database connection
│   ├── schema.js                      ← Table definitions
│   ├── Users.js                       ← User model (UPDATED!)
│   ├── migrations/                    ← Generated SQL files
│   ├── Courses.js
│   └── Lessons.js
└── utils/
    └── jwt-tokens.js                  ← Token generation

.env                                    ← Database URL (secret!)
drizzle.config.js                      ← Drizzle configuration
```

---

## ✨ What Changed (From In-Memory to Database)

### Before ❌ (In-Memory)
```javascript
class Users {
    constructor() {
        this.users = [];  // Just an array, data lost on restart
    }
    createNewUser(data) {
        // Store in memory
        this.users.push(data);
    }
}
```

### After ✅ (PostgreSQL Database)
```javascript
class Users {
    async createNewUser(data) {
        // Store in database
        const createdUser = await db.insert(users).values(data).returning();
        return createdUser[0];
    }
}
```

---

## 🔄 Step-by-Step Registration Flow

### Step 1: User Sends Registration Request

**What the user does:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "age": 28
  }'
```

**What happens:**
- Request goes to Express server
- Port 8000 receives it
- Request body is JSON

---

### Step 2: Express Routes the Request

**File: `src/routers/authRouter.js`**
```javascript
authRouter.post("/register", registerNewUser);
```

**What happens:**
- URL pattern `/api/v1/auth/register` matches
- `registerNewUser` controller function is called
- Request object contains: `{ body: { name, email, age } }`
- Response object is ready to send reply

---

### Step 3: Controller Validates & Processes

**File: `src/controllers/authController.js`**
```javascript
const registerNewUser = async (request, response) => {
    try {
        const newUserData = request.body;
        
        // Validate required fields
        if (!newUserData.name || !newUserData.email) {
            throw new Error("Name and email are required!");
        }
        
        // Check if user already exists
        const existingUser = await usersInstance.getUserByEmail(newUserData.email);
        if(existingUser) {
            throw new Error("User with this email already exists!");
        }
        
        // Create user in database
        const savedUser = await usersInstance.createNewUser(newUserData);
        
        // Send success response
        response.status(201).json({
            success: true,
            data: savedUser,
            message: "New user has been saved successfully!"
        });
    } catch(error) {
        response.status(400).json({
            success: false,
            error: error?.message,
            message: error?.message
        })
    }
}
```

**What happens at each step:**
1. Extract request body
2. Validate that name and email exist
3. Check database for existing user with same email
4. If exists → throw error
5. If not exists → create new user
6. Send response with created user

---

### Step 4: Users.js Creates User in Database

**File: `src/db/Users.js`**
```javascript
async createNewUser(newUserData) {
    try {
        // Insert into 'users' table via Drizzle ORM
        const createdUser = await db
            .insert(users)  // users table from schema
            .values({
                name: newUserData.name,
                email: newUserData.email,
                age: newUserData.age || null,
            })
            .returning();  // Return the created record
        
        return createdUser[0];  // Return first user
    } catch (error) {
        console.error("Error creating user:", error.message);
        throw error;
    }
}
```

**Database operation:**
```
┌─────────────────────────────────────────┐
│       PostgreSQL users table            │
├────┬──────────────┬──────────────────────┤
│ id │ name         │ email                │
├────┼──────────────┼──────────────────────┤
│ 1  │ John Doe     │ john@example.com     │ ← NEW USER CREATED
└────┴──────────────┴──────────────────────┘
```

---

## 🗄️ Database Setup (One-Time)

### Step 1: Verify Schema Exists

**File: `src/db/schema.js`** (already created)

The `users` table is defined:
```javascript
export const users = pgTable('users', {
  id: serial('id').primaryKey(),           // Auto-incrementing
  name: varchar('name', { length: 255 }).notNull(),  // Required
  email: varchar('email', { length: 255 }).notNull().unique(),  // Unique
  age: integer('age'),                     // Optional
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
});
```

### Step 2: Generate Migration

```bash
npm run drizzle:generate
```

**What this does:**
- Reads your schema
- Compares with database
- Creates migration file: `src/db/migrations/0000_*.sql`

**You'll see:**
```
✓ Generated migration: src/db/migrations/0000_lazy_square_spider.sql
```

### Step 3: Apply Migration

```bash
npm run drizzle:push
```

**What this does:**
- Takes the SQL migration file
- Runs it on your Neon PostgreSQL database
- Creates the actual tables

**You'll see:**
```
✓ Applying migrations...
✓ Applied migrations successfully!
```

---

## ▶️ Running the Server

### Step 1: Start the Server

```bash
npm run dev
```

**Expected output:**
```
Inside index.js
✅ Connected to Neon PostgreSQL database
HTTP Server has been started! at port: 8000
```

**What happens:**
- Server starts on port 8000
- Database connection established
- Ready to receive requests

### Step 2: Server is Running

Your API is now live:
```
✓ Register: POST http://localhost:8000/api/v1/auth/register
✓ Login:    POST http://localhost:8000/api/v1/auth/login
✓ Health:   GET  http://localhost:8000/health
```

---

## 🧪 Testing the Registration

### Method 1: Using cURL (Command Line)

**Open terminal and run:**

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "age": 28
  }'
```

**Expected response (201 Created):**
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

### Method 2: Using Postman (GUI)

1. **Open Postman**
2. **Create new request:**
   - Method: `POST`
   - URL: `http://localhost:8000/api/v1/auth/register`
3. **Headers tab:**
   - Key: `Content-Type`
   - Value: `application/json`
4. **Body tab → raw → JSON:**
```json
{
  "name": "Alice Smith",
  "email": "alice@example.com",
  "age": 25
}
```
5. **Click Send**

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Alice Smith",
    "email": "alice@example.com",
    "age": 25,
    "createdAt": "2024-04-07T14:31:20.456Z"
  },
  "message": "New user has been saved successfully!"
}
```

### Method 3: Using VSCode REST Client

Create file: `test.rest`

```rest
### Register new user
POST http://localhost:8000/api/v1/auth/register
Content-Type: application/json

{
  "name": "Bob Johnson",
  "email": "bob@example.com",
  "age": 30
}
```

Click "Send Request" above the POST line.

---

## 🔍 Checking Data in Database

### Option 1: Drizzle Studio (Visual UI) ⭐ RECOMMENDED

**Start Drizzle Studio:**
```bash
npm run drizzle:studio
```

**In another terminal, keep server running:**
```bash
npm run dev
```

**Open browser:**
```
http://localhost:5555
```

**What you see:**
- Visual database explorer
- All tables listed
- Click "users" table
- See all registered users with their data
- Can edit/delete directly from UI

**Example view:**
```
Users Table
┌────┬────────────────┬────────────────────┬─────┬──────────────────────┐
│ id │ name           │ email              │ age │ createdAt            │
├────┼────────────────┼────────────────────┼─────┼──────────────────────┤
│ 1  │ John Doe       │ john@example.com   │ 28  │ 2024-04-07 14:30:45  │
│ 2  │ Alice Smith    │ alice@example.com  │ 25  │ 2024-04-07 14:31:20  │
│ 3  │ Bob Johnson    │ bob@example.com    │ 30  │ 2024-04-07 14:32:10  │
└────┴────────────────┴────────────────────┴─────┴──────────────────────┘
```

**Steps:**
1. Open http://localhost:5555
2. Left sidebar → Click "users"
3. See all users
4. Click any user to edit
5. Add new user by clicking "+"

### Option 2: Neon Console (Web Dashboard)

1. Go to https://console.neon.tech
2. Select your project
3. Go to "SQL Editor"
4. Run query:
```sql
SELECT * FROM users;
```

**Result:**
```
 id │ name         │ email                │ age │ createdAt
────┼──────────────┼──────────────────────┼─────┼─────────────
  1 │ John Doe     │ john@example.com     │ 28  │ 2024-04-07...
  2 │ Alice Smith  │ alice@example.com    │ 25  │ 2024-04-07...
  3 │ Bob Johnson  │ bob@example.com      │ 30  │ 2024-04-07...
```

### Option 3: psql (Command Line)

If you have PostgreSQL installed:

```bash
psql "postgresql://neondb_owner:password@host/neondb"
```

Then:
```sql
SELECT * FROM users;
```

---

## ❌ Testing Error Cases

### Error 1: Missing Email

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe"
  }'
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Name and email are required!",
  "message": "Name and email are required!"
}
```

### Error 2: Duplicate Email

```bash
# First registration (works)
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "email": "john@example.com"}'

# Second registration with same email (fails)
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane", "email": "john@example.com"}'
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "User with this email already exists!",
  "message": "User with this email already exists!"
}
```

---

## 📊 Complete Registration Workflow Example

### Scenario: Register 3 Users

**User 1:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com", "age": 28}'
```
✅ Response: User created with id: 1

**User 2:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice Smith", "email": "alice@example.com", "age": 25}'
```
✅ Response: User created with id: 2

**User 3:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Bob Johnson", "email": "bob@example.com", "age": 30}'
```
✅ Response: User created with id: 3

**Check database:**
```bash
npm run drizzle:studio
# Open http://localhost:5555 → see all 3 users
```

---

## 🔧 File Breakdown (What Each File Does)

### 1. `src/routers/authRouter.js` - Route Definitions

```javascript
import { Router } from "express";
import { registerNewUser, logInUser, refreshAccessToken } from "../controllers/authController.js";

const authRouter = Router();

// POST /api/v1/auth/register
authRouter.post("/register", registerNewUser);

export default authRouter;
```

**Purpose:** Define which controller function handles which endpoint

---

### 2. `src/controllers/authController.js` - Business Logic

```javascript
const registerNewUser = async (request, response) => {
    // 1. Get data from request
    const newUserData = request.body;
    
    // 2. Validate
    if (!newUserData.name || !newUserData.email) {
        throw new Error("Name and email required");
    }
    
    // 3. Check if exists
    const existingUser = await usersInstance.getUserByEmail(newUserData.email);
    if(existingUser) {
        throw new Error("User already exists");
    }
    
    // 4. Create in database
    const savedUser = await usersInstance.createNewUser(newUserData);
    
    // 5. Send response
    response.status(201).json({ success: true, data: savedUser });
}
```

**Purpose:** Handle the business logic and validation

---

### 3. `src/db/Users.js` - User Model/DAO

```javascript
class Users {
    async createNewUser(newUserData) {
        // Insert into database
        const createdUser = await db.insert(users).values(newUserData).returning();
        return createdUser[0];
    }
    
    async getUserByEmail(userEmail) {
        // Query database for user by email
        const result = await db.select().from(users).where(eq(users.email, userEmail));
        return result.length > 0 ? result[0] : null;
    }
}
```

**Purpose:** Handle all database operations for users

---

### 4. `src/db/schema.js` - Table Definition

```javascript
export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    age: integer('age'),
    createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
});
```

**Purpose:** Define the structure of the users table

---

### 5. `src/db/index.js` - Database Connection

```javascript
import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import * as schema from './schema.js';

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

await client.connect();

export const db = drizzle(client, { schema });
```

**Purpose:** Connect to PostgreSQL and create Drizzle ORM instance

---

## 📝 Complete Test Checklist

- [ ] Server running (`npm run dev`)
- [ ] Database connected (see ✅ message)
- [ ] Migrations applied (`npm run drizzle:push`)
- [ ] Register 1st user (succeeds)
- [ ] Check data in Drizzle Studio
- [ ] Register 2nd user with different email (succeeds)
- [ ] Try duplicate email (fails with correct error)
- [ ] Try missing email (fails with correct error)
- [ ] 3+ users visible in Drizzle Studio

---

## 🎓 Key Concepts Learned

✅ **Request Flow:** Route → Controller → Model → Database
✅ **Async/Await:** Database operations are asynchronous
✅ **Validation:** Check data before saving to database
✅ **Error Handling:** Catch errors and send proper responses
✅ **HTTP Status Codes:** 201 (created), 400 (error)
✅ **Drizzle ORM:** Interact with database using JavaScript
✅ **Migrations:** Track schema changes in version control
✅ **Drizzle Studio:** Visual tool to manage database

---

## 🚀 Next Steps

1. **Add Login** - Check database for user, verify password
2. **Add Validation** - Email format, password strength
3. **Add Authentication** - JWT tokens (already set up!)
4. **Add More Fields** - Profile picture, phone number, etc.
5. **Add Relationships** - Users → Courses enrollment

---

## 🆘 Troubleshooting

### Problem: "Database connection refused"

**Solution:**
- Check `.env` DATABASE_URL
- Verify Neon project exists
- Ensure IP whitelist allows connections

### Problem: "User table doesn't exist"

**Solution:**
```bash
npm run drizzle:generate
npm run drizzle:push
```

### Problem: "Unique constraint violation"

**Solution:**
- Email already exists in database
- Register with different email

### Problem: Cannot see users in Studio

**Solution:**
1. Check server is running (`npm run dev`)
2. Check Studio is running (`npm run drizzle:studio`)
3. Refresh Studio UI (F5)
4. Check migrations were applied

---

## 📚 Summary

You now have a complete, working user registration system:

✅ API endpoint receives registration requests
✅ Controller validates and processes data
✅ Database stores users permanently
✅ You can verify data with Drizzle Studio
✅ Error handling for edge cases
✅ All code is JavaScript (no TypeScript needed!)

Congratulations! 🎉

---

## 🧭 Navigation

| Link | Direction |
|------|-----------|
| **[← Back to Tutorials](../README.md)** | Overview |
| **[← Previous: 04_QUICK_REFERENCE.md](./04_QUICK_REFERENCE.md)** | Cheat sheet |
| **[← Start from beginning: 00_GETTING_STARTED.md](./00_GETTING_STARTED.md)** | Foundations |

**Learning Path:** 00_GETTING_STARTED → 01_MIGRATIONS → 02_CRUD_OPERATIONS → 03_ADVANCED_QUERIES → 04_QUICK_REFERENCE → 05_USER_REGISTRATION_FLOW

**📚 You've completed all tutorials! Next steps:**
- Review the [COMMANDS.md](../../COMMANDS.md) reference
- Check [FLOW_DIAGRAM.md](../../FLOW_DIAGRAM.md) for visual understanding
- Test with [test-registration.rest](../../test-registration.rest)
- Return to [tutorials/README.md](../README.md) for additional resources
