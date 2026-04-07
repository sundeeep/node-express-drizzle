# PostgreSQL + Drizzle ORM Tutorial with Neon DB

Complete step-by-step guide to set up PostgreSQL with Drizzle ORM using Neon Database.

---

## 📋 Table of Contents

1. [Prerequisites & Setup](#prerequisites--setup)
2. [Understanding Database Concepts](#understanding-database-concepts)
3. [Installation & Configuration](#installation--configuration)
4. [Creating Your First Schema](#creating-your-first-schema)
5. [Running Migrations](#running-migrations)
6. [CRUD Operations](#crud-operations)
7. [Relationships & Joins](#relationships--joins)
8. [Real-World Example](#real-world-example)

---

## Prerequisites & Setup

### What You'll Need

- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- **Neon Account** (free at https://neon.tech)
- **Basic JavaScript knowledge**

### What We're Installing

```bash
# Already installed in your project:
npm list drizzle-orm drizzle-kit pg
```

**Expected output:**
```
drizzle-orm@0.45.1
drizzle-kit@0.31.10
pg@8.20.0
```

---

## Understanding Database Concepts

### What is PostgreSQL?

PostgreSQL is a powerful, open-source relational database that stores data in structured tables with rows and columns.

```
Example Table Structure:
┌─────────┬───────────┬─────────────┐
│   id    │   name    │   email     │
├─────────┼───────────┼─────────────┤
│    1    │  Sundeeep │ user@ex.com │
│    2    │   Sarah   │ s@ex.com    │
└─────────┴───────────┴─────────────┘
```


### What is Drizzle ORM?

**ORM** = Object-Relational Mapping

Drizzle lets you interact with your database using JavaScript instead of raw SQL:

```javascript
// Without ORM (Raw SQL - harder)
const result = await db.query('SELECT * FROM users WHERE id = $1', [1]);

// With Drizzle ORM (Easier, type-safe)
const user = await db.select().from(users).where(eq(users.id, 1));
```

### What is Neon?

Neon is a managed PostgreSQL platform that:
- ✅ Hosts your database in the cloud
- ✅ Provides a free tier (great for learning)
- ✅ Auto-scales and handles backups
- ✅ Gives you a connection string (DATABASE_URL)

---

## Installation & Configuration

### Step 1: Get Your Neon Database URL

1. Sign up at https://neon.tech
2. Create a new project
3. Go to "Connection String" 
4. Copy the full PostgreSQL URL

**Your URL looks like:**
```
postgresql://neondb_owner:password@host/dbname?sslmode=require&channel_binding=require
```

### Step 2: Add to .env File

**File: `.env`**

```bash
# Your Neon database connection
DATABASE_URL=postgresql://neondb_owner:npg_atMGxAlYC61y@ep-dry-star-a1g1acfh-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

✅ This is already added to your `.env`!

### Step 3: Create drizzle.config.ts

This config file tells Drizzle Kit how to manage your database.

**File: `drizzle.config.js` (in root)**

```javascript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.js',           // Where you define tables
  out: './src/db/migrations',             // Where migrations are saved
  driver: 'pg',                           // PostgreSQL driver
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
```

**What each part means:**

| Option | Purpose |
|--------|---------|
| `schema` | Where your table definitions live |
| `out` | Generated migration files folder |
| `driver` | Database type (pg = PostgreSQL) |
| `dbCredentials` | How to connect to your database |

---

## Creating Your First Schema

### What is a Schema?

A schema defines the structure of your database tables - like a blueprint.

### Step 1: Create Schema Directory

```bash
mkdir -p src/db
```

### Step 2: Define Your First Table

**File: `src/db/schema.js`**

```javascript
import { pgTable, serial, varchar, timestamp, integer } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Define a USERS table
export const users = pgTable('users', {
  // Column 1: id (auto-incrementing primary key)
  id: serial('id').primaryKey(),
  
  // Column 2: name (text, max 255 chars, required)
  name: varchar('name', { length: 255 }).notNull(),
  
  // Column 3: email (text, max 255 chars, required, unique)
  email: varchar('email', { length: 255 }).notNull().unique(),
  
  // Column 4: age (number, optional)
  age: integer('age'),
  
  // Column 5: created_at (timestamp, auto-set to now)
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
});
```

**What each type means:**

| Type | Purpose | Example |
|------|---------|---------|
| `serial` | Auto-incrementing number | 1, 2, 3... |
| `varchar` | Text (string) | "John Doe" |
| `integer` | Whole number | 25, 100 |
| `timestamp` | Date & Time | 2024-01-15 10:30:00 |

**Column Modifiers:**

| Modifier | Meaning |
|----------|---------|
| `.primaryKey()` | Unique identifier for each row |
| `.notNull()` | Must have a value |
| `.unique()` | No duplicates allowed |
| `.default()` | Auto-set if not provided |

### Step 3: Create Another Table (Courses)

```typescript
// Add this to src/db/schema.ts

export const courses = pgTable('courses', {
  id: serial('id').primaryKey(),
  
  title: varchar('title', { length: 255 }).notNull(),
  
  description: varchar('description', { length: 1000 }),
  
  instructor: varchar('instructor', { length: 255 }).notNull(),
  
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
});
```

---

## Running Migrations

### What is a Migration?

A migration is a file that tells PostgreSQL how to create/update your tables. It's like version control for your database schema.

### Step 1: Generate Migration

```bash
npm run drizzle:generate
```

**What this does:**
- Reads your schema from `src/db/schema.ts`
- Compares it with the database
- Creates a migration file in `src/db/migrations/`

**You'll see:**
```
✓ Generated migration: src/db/migrations/0000_lazy_<randomname>.sql
```

### Step 2: Check Generated SQL

**File: `src/db/migrations/0000_lazy_<timestamp>.sql`**

The file will contain SQL like:

```sql
CREATE TABLE "users" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" varchar(255) NOT NULL,
  "email" varchar(255) NOT NULL UNIQUE,
  "age" integer,
  "created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "courses" (
  "id" serial PRIMARY KEY NOT NULL,
  "title" varchar(255) NOT NULL,
  "description" varchar(1000),
  "instructor" varchar(255) NOT NULL,
  "created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
```

### Step 3: Run Migration (Apply to Database)

```bash
npm run drizzle:push
```

**What this does:**
- Takes the migration SQL
- Executes it on your Neon database
- Creates the actual tables

**Success message:**
```
✓ Applying migrations...
✓ Applied migrations successfully!
```

---

## CRUD Operations

CRUD = Create, Read, Update, Delete

### Step 1: Create Database Connection

**File: `src/db/index.ts`**

```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import * as schema from './schema';

// Create PostgreSQL client
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

// Connect to database
await client.connect();

// Create Drizzle instance
export const db = drizzle(client, { schema });
```

### Step 2: CREATE - Insert Data

```typescript
import { db } from './src/db';
import { users } from './src/db/schema';

// Insert one user
await db.insert(users).values({
  name: 'John Doe',
  email: 'john@example.com',
  age: 28,
});

// Insert multiple users
await db.insert(users).values([
  { name: 'Alice', email: 'alice@example.com', age: 25 },
  { name: 'Bob', email: 'bob@example.com', age: 30 },
]);
```

**What happens in database:**
```
┌────┬───────┬──────────────────┬─────┐
│ id │ name  │      email       │ age │
├────┼───────┼──────────────────┼─────┤
│ 1  │ John  │ john@example.com │ 28  │
│ 2  │ Alice │ alice@example.com│ 25  │
│ 3  │ Bob   │ bob@example.com  │ 30  │
└────┴───────┴──────────────────┴─────┘
```

### Step 3: READ - Query Data

```typescript
import { eq } from 'drizzle-orm';

// Get all users
const allUsers = await db.select().from(users);

// Get user by ID
const user = await db.select().from(users).where(eq(users.id, 1));

// Get user by email
const userByEmail = await db.select()
  .from(users)
  .where(eq(users.email, 'john@example.com'));

// Get with limit
const firstThree = await db.select().from(users).limit(3);

// Get with conditions
const adults = await db.select()
  .from(users)
  .where(gt(users.age, 18)); // Import gt (greater than)
```

### Step 4: UPDATE - Modify Data

```typescript
import { eq } from 'drizzle-orm';

// Update one user
await db.update(users)
  .set({ age: 29 })
  .where(eq(users.id, 1));

// Update multiple fields
await db.update(users)
  .set({
    name: 'John Updated',
    age: 30,
  })
  .where(eq(users.email, 'john@example.com'));
```

### Step 5: DELETE - Remove Data

```typescript
import { eq } from 'drizzle-orm';

// Delete one user
await db.delete(users).where(eq(users.id, 1));

// Delete by email
await db.delete(users).where(eq(users.email, 'john@example.com'));
```

---

## Relationships & Joins

### Understanding Relationships

**One-to-Many**: One user can have many courses enrolled

```
Users        Enrollments       Courses
┌────┐       ┌────────────┐    ┌────┐
│ id │───┬──→│ user_id    │    │ id │
├────┤   │   │ course_id  │──→ │ id │
│ 1  │   │   ├────────────┤    │ 1  │
└────┘   │   │ user_id: 1 │    │ 2  │
         └──→│ course_id:1│──→ │ 3  │
             └────────────┘    └────┘
```

### Step 1: Add Enrollment Table with Foreign Keys

```typescript
// Add to src/db/schema.ts

import { relations } from 'drizzle-orm';

export const enrollments = pgTable('enrollments', {
  id: serial('id').primaryKey(),
  
  // Foreign key to users table
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  
  // Foreign key to courses table
  courseId: integer('course_id')
    .notNull()
    .references(() => courses.id, { onDelete: 'cascade' }),
  
  enrolledAt: timestamp('enrolled_at').default(sql`CURRENT_TIMESTAMP`),
});

// Define relationships for easier querying
export const usersRelations = relations(users, ({ many }) => ({
  enrollments: many(enrollments),
}));

export const coursesRelations = relations(courses, ({ many }) => ({
  enrollments: many(enrollments),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  user: one(users, {
    fields: [enrollments.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id],
  }),
}));
```

**What this means:**
- `references()` = This column points to another table
- `onDelete: 'cascade'` = If user is deleted, delete their enrollments too
- `relations()` = Makes querying relationships easier

### Step 2: Generate and Run Migration

```bash
npm run drizzle:generate
npm run drizzle:push
```

### Step 3: Query with Relationships

```typescript
import { db } from './src/db';

// Get all enrollments with user and course details
const enrollments = await db.query.enrollments.findMany({
  with: {
    user: true,   // Include user data
    course: true, // Include course data
  },
});

// Result:
/*
[
  {
    id: 1,
    userId: 1,
    courseId: 1,
    enrolledAt: '2024-01-15T10:30:00',
    user: { id: 1, name: 'John', email: 'john@example.com', age: 28, ... },
    course: { id: 1, title: 'React Basics', instructor: 'Jane', ... }
  }
]
*/
```

---

## Real-World Example

### Building a Course Enrollment System

Let's create actual API endpoints to manage users and courses.

### File Structure

```
src/
├── db/
│   ├── index.ts          ← Database connection
│   ├── schema.ts         ← Table definitions
│   └── migrations/       ← Auto-generated SQL
├── routes/
│   ├── users.js
│   └── courses.js
└── index.js              ← Main server
```

### Step 1: Database Connection

**File: `src/db/index.ts`**

```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import * as schema from './schema';

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

await client.connect();

export const db = drizzle(client, { schema });
```

### Step 2: User Routes

**File: `src/routes/users.js`**

```javascript
import { Router } from 'express';
import { db } from '../db/index.ts';
import { users } from '../db/schema.ts';
import { eq } from 'drizzle-orm';

const router = Router();

// GET all users
router.get('/', async (req, res) => {
  try {
    const allUsers = await db.select().from(users);
    res.json(allUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Create user
router.post('/', async (req, res) => {
  try {
    const { name, email, age } = req.body;
    
    const newUser = await db.insert(users).values({
      name,
      email,
      age: age || null,
    }).returning();
    
    res.status(201).json(newUser[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await db.select()
      .from(users)
      .where(eq(users.id, parseInt(req.params.id)));
    
    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT - Update user
router.put('/:id', async (req, res) => {
  try {
    const { name, email, age } = req.body;
    
    const updated = await db.update(users)
      .set({ name, email, age })
      .where(eq(users.id, parseInt(req.params.id)))
      .returning();
    
    res.json(updated[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE user
router.delete('/:id', async (req, res) => {
  try {
    await db.delete(users).where(eq(users.id, parseInt(req.params.id)));
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

### Step 3: Update Main Server

**File: `src/index.js`**

```javascript
import express from 'express';
import dotenv from 'dotenv';
import usersRouter from './routes/users.js';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/users', usersRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Database connected!' });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
```

### Step 4: Test with cURL

```bash
# Create user
curl -X POST http://localhost:8000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "email": "john@example.com", "age": 28}'

# Get all users
curl http://localhost:8000/api/users

# Get user by ID
curl http://localhost:8000/api/users/1

# Update user
curl -X PUT http://localhost:8000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "John Updated", "age": 29}'

# Delete user
curl -X DELETE http://localhost:8000/api/users/1
```

---

## Quick Commands Reference

```bash
# Generate migrations from schema changes
npm run drizzle:generate

# Apply migrations to database
npm run drizzle:push

# Open Drizzle Studio (UI to manage DB)
npm run drizzle:studio

# Start development server
npm run dev
```

---

## Common Errors & Solutions

### Error: "Cannot find module 'drizzle-orm/node-postgres'"

**Solution:** Make sure you've installed dependencies:
```bash
npm install
```

### Error: "Database connection refused"

**Reasons:**
- Wrong DATABASE_URL in .env
- Neon project not created
- Network firewall blocking connection

**Solution:** Verify your DATABASE_URL matches Neon dashboard exactly.

### Error: "UNIQUE constraint failed: users.email"

**Meaning:** You tried to insert duplicate email

**Solution:** Check if email already exists before inserting:
```typescript
const existing = await db.select().from(users).where(eq(users.email, email));
if (existing.length > 0) throw new Error('Email already exists');
```

---

## Next Steps

1. **Add validation** - Use libraries like `zod` to validate input
2. **Add authentication** - JWT tokens for user login (already in your project!)
3. **Add more features** - Comments, ratings, advanced queries
4. **Deploy** - Push to production with Railway, Vercel, or Render

---

## Useful Resources

- **Drizzle Docs**: https://orm.drizzle.team
- **Neon Docs**: https://neon.tech/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs
- **Node-postgres**: https://node-postgres.com

---

## Summary

✅ Created `.env` with DATABASE_URL
✅ Created `drizzle.config.ts` for configuration
✅ Defined database schema in `src/db/schema.ts`
✅ Generated and ran migrations
✅ Implemented CRUD operations
✅ Added relationships between tables
✅ Built working API endpoints

You now have a fully functional PostgreSQL + Drizzle ORM setup! 🎉

---

## 🧭 Navigation

| Link | Direction |
|------|-----------|
| **[← Back to Tutorials](../README.md)** | Overview |
| **[Next: 01_MIGRATIONS.md →](./01_MIGRATIONS.md)** | Manage schema changes |

**Learning Path:** 00_GETTING_STARTED → 01_MIGRATIONS → 02_CRUD_OPERATIONS → 03_ADVANCED_QUERIES → 04_QUICK_REFERENCE → 05_USER_REGISTRATION_FLOW
