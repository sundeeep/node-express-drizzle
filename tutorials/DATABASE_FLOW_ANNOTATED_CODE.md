# Database Flow - Annotated Code Walkthrough

## Step 1️⃣: The Starting Point - src/index.js

```javascript
// FILE: src/index.js
// This is where Node.js starts (when you run: node src/index.js)

import express from "express";
import dotenv from "dotenv";

// ⚠️ IMPORTANT: These imports trigger the database connection!
import coursesRouter from "./routers/coursesRouter.js";     // Line 3
import lessonsRouter from "./routers/lessonsRouter.js";     // Line 4
import authRouter from "./routers/authRouter.js";           // Line 5 ← authRouter imports db!

dotenv.config();
// ↑ Loads .env file AGAIN (already done in db/index.js, this is redundant)

import cookieParser from "cookie-parser";

const PORT = process.env.PORT;
const app = express();

console.log("Inside index.js");  // ← This prints AFTER database connects!

// middlewares
app.use(cookieParser());
app.use(express.json());

// ... routes and server start
```

**What happens:**
- Line 3: `import authRouter` triggers loading of authRouter.js
- That triggers authController → Users → db/index.js
- **DATABASE CONNECTS** (try-catch runs)
- Then script continues to line 13

---

## Step 2️⃣: First Router - src/routers/authRouter.js

```javascript
// FILE: src/routers/authRouter.js
// This is imported by src/index.js

import { Router } from "express";
import { logInUser, registerNewUser, refreshAccessToken } from "../controllers/authController.js";
// ↑ This imports authController.js

const authRouter = Router();

authRouter.post("/register", registerNewUser);
authRouter.post("/login", logInUser);
authRouter.get("/refresh", refreshAccessToken);

export default authRouter;
```

**What happens:**
- When src/index.js imports authRouter, this file loads
- It imports authController
- This triggers loading of authController.js

---

## Step 3️⃣: The Controller - src/controllers/authController.js

```javascript
// FILE: src/controllers/authController.js
// This is imported by authRouter.js

import Users from "../db/Users.js";
// ↑ THIS IS THE KEY LINE!
// It imports Users.js, which imports the database!

import { generateAccessToken, generateRefreshToken } from "../utils/jwt-tokens.js";
import jwt from "jsonwebtoken";

const usersInstance = new Users();
// ↑ Creates an instance of Users class

const registerNewUser = async (request, response) => {
    try {
        const newUserData = request.body;

        // Validate required fields
        if (!newUserData.name || !newUserData.email) {
            throw new Error("Name and email are required!");
        }

        // Check if user already exists
        const existingUser = await usersInstance.getUserByEmail(newUserData.email);
        // ↑ This uses the db object (which is already connected!)

        if(existingUser){
            throw new Error("User with this email already exists!");
        }

        // Save the new user data in database
        const savedUser = await usersInstance.createNewUser(newUserData);
        // ↑ This also uses the db object

        if(!savedUser){
            throw new Error("User not saved in db! Try again.")
        }

        response.status(201).json({
            success: true,
            data: savedUser,
            message: "New user has been saved successfully!"
        });
    } catch(error){
        console.error("Register error:", error);
        response.status(400).json({
            success: false,
            error: error?.message,
            message: error?.message
        })
    }
}

// ... other functions

export {
    registerNewUser,
    logInUser,
    refreshAccessToken
}
```

**What happens:**
- authController imports Users
- This triggers loading of Users.js
- Which imports the database!

---

## Step 4️⃣: The Database Class - src/db/Users.js

```javascript
// FILE: src/db/Users.js
// This is imported by authController.js

import { db } from "./index.js";
// ↑ THIS TRIGGERS THE DATABASE CONNECTION!
// When this line is encountered, src/db/index.js loads and executes

import { users } from "./schema.js";
import { eq } from "drizzle-orm";

class Users {
    constructor() {
        // Database operations - no longer in-memory
    }

    /**
     * Create a new user in the database
     */
    async createNewUser(newUserData) {
        try {
            // Insert user into database and return the created record
            const createdUser = await db    // ← Uses the db object
                .insert(users)
                .values({
                    name: newUserData.name,
                    email: newUserData.email,
                    age: newUserData?.age || null,
                })
                .returning();

            return createdUser[0];
        } catch (error) {
            console.error("Error creating user:", error.message);
            throw error;
        }
    }

    /**
     * Get a user by email from the database
     */
    async getUserByEmail(userEmail) {
        try {
            const result = await db    // ← Uses the db object
                .select()
                .from(users)
                .where(eq(users.email, userEmail));

            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error("Error fetching user by email:", error.message);
            throw error;
        }
    }

    // ... more methods that use db object
}

export default Users;
```

**What happens:**
- Line 1: `import { db } from "./index.js"` is encountered
- src/db/index.js loads and runs completely
- The try-catch block in db/index.js EXECUTES
- Database connects successfully (or fails and crashes)
- The `db` object is now available for use
- Users.js finishes loading
- Back to authController.js, which finishes loading
- Back to authRouter.js, which finishes loading
- Back to src/index.js, which continues from line 6

---

## Step 5️⃣: The Database Module - src/db/index.js

```javascript
// FILE: src/db/index.js
// This is imported by Users.js

import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import * as schema from './schema.js';

// TODO: Teach the boundary of dotenv
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();
// ↑ Loads DATABASE_URL from .env file
// Output: [dotenv] injecting env (7) from .env

/**
 * Initialize PostgreSQL client
 * Connects to Neon database using CONNECTION_STRING from .env
 */
const client = new Client({
  connectionString: process.env.DATABASE_URL,  // From .env
  ssl: {
    rejectUnauthorized: false,  // Required by Neon
  },
});

/**
 * Connect to the database
 * ⚠️ THIS IS THE CRITICAL PART!
 */
try {
  // ← Await PAUSES execution here until connection is complete
  await client.connect();
  
  // If we get here, connection succeeded!
  console.log('✅ Connected to Neon PostgreSQL database');
  // Output line 3 in console
  
} catch (error) {
  // If connection failed, we catch the error here
  console.error('❌ Failed to connect to database:', error.message);
  
  // Stop the entire application!
  // Error code 1 = something went wrong
  process.exit(1);
}

/**
 * Create Drizzle ORM instance
 * This is what we use for all database operations
 */
export const db = drizzle(client, { schema });
// ↑ This db object is exported and used throughout the app

// Optional: Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing database connection...');
  await client.end();
  process.exit(0);
});
```

**What happens:**
```
Timeline:
┌─ dotenv loads .env
├─ Client config created
├─ await client.connect() PAUSES
│  └─ Network call to Neon PostgreSQL
│     └─ Connection established ✅
├─ console.log('✅ Connected...') executes
└─ db object exported
```

**If connection fails:**
```
Timeline:
┌─ dotenv loads .env
├─ Client config created
├─ await client.connect() PAUSES
│  └─ Network call to Neon PostgreSQL
│     └─ Connection FAILS ❌
├─ catch(error) executes
├─ console.error('❌ Failed...') prints
└─ process.exit(1) STOPS APP COMPLETELY ⚠️
```

---

## Step 6️⃣: The Schema - src/db/schema.js

```javascript
// FILE: src/db/schema.js
// This defines all database tables

import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
  text,
  boolean,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

/**
 * USERS TABLE
 * Stores user information
 */
export const users = pgTable('users', {
  id: serial('id').primaryKey(),           // Auto-incrementing ID
  name: varchar('name', { length: 255 }).notNull(),  // Required name
  email: varchar('email', { length: 255 }).notNull().unique(),  // Unique email
  age: integer('age'),                      // Optional age
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),  // Auto timestamp
});

// ... other tables (courses, enrollments, lessons, etc.)

/**
 * RELATIONSHIPS
 * Define connections between tables
 */
export const usersRelations = relations(users, ({ many }) => ({
  enrollments: many(enrollments),
  lessonsProgress: many(lessonsProgress),
}));

// ... other relationships
```

**What this is:**
- Defines the structure of all database tables
- Used by Drizzle ORM to know what data can be stored
- Imported in db/index.js on line 3

---

## Complete Flow Diagram

```
Node starts: node src/index.js
│
├─ src/index.js line 3: import authRouter
│  │
│  └─ src/routers/authRouter.js line 2: import authController
│     │
│     └─ src/controllers/authController.js line 1: import Users
│        │
│        └─ src/db/Users.js line 1: import { db } from "./index.js"
│           │
│           └─ src/db/index.js EXECUTES:
│              ├─ Line 8: dotenv.config() → OUTPUT: [dotenv] injecting...
│              ├─ Line 14-20: Create client config
│              ├─ Line 26: await client.connect()  ← PAUSES HERE
│              │           ↓ Network request to Neon
│              │           ✅ Connection succeeds!
│              ├─ Line 27: console.log('✅ Connected...') → OUTPUT: ✅ Connected
│              └─ Line 37: export const db
│
│  (db object is now ready for the entire app)
│
├─ src/index.js line 4: import lessonsRouter (uses cached db)
├─ src/index.js line 5: import authRouter (uses cached db)
├─ src/index.js line 6: dotenv.config() → OUTPUT: [dotenv] injecting... (0)
├─ src/index.js line 13: console.log("Inside index.js") → OUTPUT: Inside index.js
├─ src/index.js line 16-17: Setup middlewares
├─ src/index.js line 19-25: Setup /health route
├─ src/index.js line 29-31: Setup routers
│
└─ src/index.js line 33-35: app.listen(PORT)
   → OUTPUT: HTTP Server has been started! at port: 8000
   
✅ Server is now running and database is connected!
```

---

## 🔍 Tracing the Execution

**When you run:** `node src/index.js`

**Console output (in order):**
```
[dotenv@17.3.1] injecting env (7) from .env
(SSL warning)
✅ Connected to Neon PostgreSQL database
[dotenv@17.3.1] injecting env (0) from .env
Inside index.js
HTTP Server has been started! at port: 8000
```

**Matching to code:**
- Line 1: `src/db/index.js` line 8 (dotenv.config())
- Line 2: `pg` library warning
- Line 3: `src/db/index.js` line 27 (connection success)
- Line 4: `src/index.js` line 6 (dotenv.config())
- Line 5: `src/index.js` line 13 (console.log)
- Line 6: `src/index.js` line 34 (app.listen callback)

---

## ⚠️ What If Connection Fails?

**Scenario:** DATABASE_URL is wrong or Neon is down

```javascript
// src/db/index.js line 25-31
try {
  await client.connect();  // ← Network request fails!
  console.log('✅ Connected to Neon PostgreSQL database');
} catch (error) {
  // We land here!
  console.error('❌ Failed to connect to database:', error.message);
  
  // THIS STOPS THE ENTIRE APPLICATION!
  process.exit(1);  // ← Exit code 1 = error
}

// ↑ This is AS FAR AS EXECUTION GOES!
// Lines below this are never reached!
// src/index.js never finishes!
// Server never starts!
```

**Console output:**
```
[dotenv@17.3.1] injecting env (7) from .env
(SSL warning)
❌ Failed to connect to database: connect ECONNREFUSED 127.0.0.1:5432
```

**Then app stops completely.** No server, no "Inside index.js", nothing!

---

## 🎯 Key Takeaways for Students

1. **Import chains determine execution order**
   - Not file names, not folder structure
   - It's about what imports what

2. **The try-catch block is critical**
   - It ensures database is connected before app runs
   - Or fails loudly and clearly

3. **await pauses execution**
   - Waits for database connection
   - Without await, code would continue before database is ready

4. **process.exit(1) stops everything**
   - It's a kill switch
   - Used when something critical fails

5. **Module caching is real**
   - First import executes the file
   - Later imports reuse the same object
   - All files get the SAME `db` instance

---

**Code is just following instructions in order!** 🚀
