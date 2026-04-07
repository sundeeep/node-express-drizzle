# Quick Reference & Cheat Sheet

Copy-paste ready code snippets for common tasks.

---

## Project Setup (First Time)

### 1. Install Dependencies

```bash
npm install
```

### 2. Add DATABASE_URL to .env

```bash
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
```

✅ Already done! Check `.env` file.

### 3. Create drizzle.config.ts

```bash
# Already created in root folder
ls -la drizzle.config.ts
```

---

## Working with Migrations

### Generate Migration

```bash
npm run drizzle:generate
```

### Apply Migration

```bash
npm run drizzle:push
```

### View Database UI

```bash
npm run drizzle:studio
# Opens at http://localhost:5555
```

### Drop Everything (⚠️ Use Carefully)

```bash
npm run drizzle:drop
```

---

## Schema Definitions (src/db/schema.ts)

### Basic Table


```typescript
import { pgTable, serial, varchar, integer, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  age: integer('age'),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
});
```

### Column Types Cheat Sheet

| Drizzle Type | PostgreSQL | Example |
|--------------|-----------|---------|
| `serial()` | SERIAL | 1, 2, 3... |
| `varchar(len)` | VARCHAR | "John" |
| `text()` | TEXT | Long text |
| `integer()` | INTEGER | 42 |
| `boolean()` | BOOLEAN | true/false |
| `timestamp()` | TIMESTAMP | 2024-01-15 10:30:00 |
| `date()` | DATE | 2024-01-15 |
| `decimal()` | DECIMAL | 10.50 |
| `json()` | JSON | `{ key: "value" }` |

### Column Modifiers

```typescript
// Required field
.notNull()

// Unique (no duplicates)
.unique()

// Primary key (unique identifier)
.primaryKey()

// Default value
.default('value')
.default(sql`CURRENT_TIMESTAMP`)

// Foreign key (links to another table)
.references(() => users.id, { onDelete: 'cascade' })
```

---

## Database Connection (src/db/index.ts)

```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import * as schema from './schema';

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();

export const db = drizzle(client, { schema });
```

---

## CRUD Operations

### Create (INSERT)

```javascript
import { db } from './src/db/index.ts';
import { users } from './src/db/schema.ts';

// Single insert
await db.insert(users).values({
  name: 'John',
  email: 'john@example.com',
  age: 28,
});

// Bulk insert
await db.insert(users).values([
  { name: 'Alice', email: 'alice@example.com' },
  { name: 'Bob', email: 'bob@example.com' },
]);

// Get return value
const newUser = await db.insert(users).values({
  name: 'Sarah',
  email: 'sarah@example.com',
}).returning();

console.log(newUser[0].id); // Get new ID
```

### Read (SELECT)

```javascript
import { eq, gt, lt, and, or } from 'drizzle-orm';

// All records
const all = await db.select().from(users);

// Specific columns
const names = await db.select({ name: users.name }).from(users);

// By condition
const john = await db.select().from(users)
  .where(eq(users.email, 'john@example.com'));

// Multiple conditions
const adults = await db.select().from(users)
  .where(and(
    gt(users.age, 18),
    eq(users.status, 'active')
  ));

// Order by
const sorted = await db.select().from(users)
  .orderBy(users.name);

// Limit & offset
const page1 = await db.select().from(users)
  .limit(10)
  .offset(0);

// Count
import { count } from 'drizzle-orm';
const total = await db.select({ count: count() }).from(users);
console.log(total[0].count);
```

### Update (UPDATE)

```javascript
// Update single field
await db.update(users)
  .set({ age: 29 })
  .where(eq(users.id, 1));

// Update multiple fields
await db.update(users)
  .set({ name: 'John', age: 30 })
  .where(eq(users.id, 1));

// Get updated record
const updated = await db.update(users)
  .set({ age: 30 })
  .where(eq(users.id, 1))
  .returning();

console.log(updated[0]);
```

### Delete (DELETE)

```javascript
// Delete one
await db.delete(users).where(eq(users.id, 1));

// Delete multiple
await db.delete(users).where(gt(users.age, 60));

// Get deleted record
const deleted = await db.delete(users)
  .where(eq(users.id, 1))
  .returning();

console.log(deleted[0]);
```

---

## Relationships & Joins

### Define Relationships

```typescript
// In schema.ts
import { relations } from 'drizzle-orm';

export const usersRelations = relations(users, ({ many }) => ({
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

### Query with Relationships

```javascript
// Get user with all enrollments
const user = await db.query.users.findFirst({
  where: eq(users.id, 1),
  with: {
    enrollments: true,
  },
});

// Nested relationships
const courses_list = await db.query.courses.findMany({
  with: {
    enrollments: {
      with: {
        user: true,
      },
    },
  },
});

// With filters
const userActive = await db.query.users.findFirst({
  where: eq(users.id, 1),
  with: {
    enrollments: {
      where: eq(enrollments.status, 'active'),
    },
  },
});
```

---

## Filtering Operators

```javascript
import { 
  eq, 
  gt, 
  lt, 
  gte, 
  lte,
  and, 
  or,
  not,
  like,
  inArray,
  between,
  isNull,
  isNotNull,
} from 'drizzle-orm';

// Comparison
eq(users.id, 1)           // =
gt(users.age, 25)         // >
lt(users.age, 65)         // <
gte(users.age, 25)        // >=
lte(users.age, 65)        // <=

// Logical
and(cond1, cond2)         // AND
or(cond1, cond2)          // OR
not(condition)            // NOT

// Pattern
like(users.name, '%John%') // SQL LIKE
like(users.name, 'John%')  // Starts with

// Arrays
inArray(users.id, [1,2,3]) // IN (1,2,3)

// Range
between(users.age, 25, 65) // BETWEEN

// Null
isNull(users.age)         // IS NULL
isNotNull(users.age)      // IS NOT NULL
```

---

## Common API Patterns

### Get All with Pagination

```javascript
app.get('/api/users', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = 10;
  const offset = (page - 1) * pageSize;

  const users_list = await db.select()
    .from(users)
    .limit(pageSize)
    .offset(offset);

  res.json(users_list);
});
```

### Get One by ID

```javascript
app.get('/api/users/:id', async (req, res) => {
  const user = await db.select()
    .from(users)
    .where(eq(users.id, parseInt(req.params.id)));

  if (user.length === 0) {
    return res.status(404).json({ error: 'Not found' });
  }

  res.json(user[0]);
});
```

### Create

```javascript
app.post('/api/users', async (req, res) => {
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
```

### Update

```javascript
app.put('/api/users/:id', async (req, res) => {
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
```

### Delete

```javascript
app.delete('/api/users/:id', async (req, res) => {
  try {
    await db.delete(users).where(eq(users.id, parseInt(req.params.id)));
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Search

```javascript
app.get('/api/users/search', async (req, res) => {
  const query = req.query.q || '';

  const results = await db.select()
    .from(users)
    .where(like(users.name, `%${query}%`));

  res.json(results);
});
```

---

## Aggregation Functions

```javascript
import { count, sum, avg, max, min } from 'drizzle-orm';

// Count rows
await db.select({ count: count() }).from(users);

// Sum values
await db.select({ total: sum(orders.amount) }).from(orders);

// Average
await db.select({ average: avg(scores.points) }).from(scores);

// Max/Min
await db.select({ max: max(users.age) }).from(users);
await db.select({ min: min(users.age) }).from(users);

// With grouping
await db.select({
  courseId: enrollments.courseId,
  count: count(),
}).from(enrollments)
  .groupBy(enrollments.courseId);
```

---

## Transaction Support

```javascript
import { db } from './src/db/index.ts';

// Multiple operations as one transaction
// If any fails, all are rolled back
await db.transaction(async (tx) => {
  // Create user
  const user = await tx.insert(users).values({
    name: 'John',
    email: 'john@example.com',
  }).returning();

  // Enroll in course
  await tx.insert(enrollments).values({
    userId: user[0].id,
    courseId: 1,
  });

  // If this fails, both are rolled back
});
```

---

## Environment Variables

### .env File

```bash
# Database connection
DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require

# Server
PORT=8000
NODE_ENVIRONMENT=development

# JWT (if using auth)
ACCESS_TOKEN_SECRET=your-secret-key
REFRESH_TOKEN_SECRET=your-refresh-secret
```

### Load in Code

```javascript
import dotenv from 'dotenv';
dotenv.config();

const dbUrl = process.env.DATABASE_URL;
const port = process.env.PORT || 8000;
```

---

## Debugging & Logging

### Enable SQL Logging

In `drizzle.config.ts`:

```typescript
export default defineConfig({
  // ... other config
  verbose: true, // Logs all SQL queries
});
```

### Manual Logging

```javascript
const users_list = await db.select().from(users);
console.log('Query result:', users_list);

// With timestamps
console.log(`[${new Date().toISOString()}] Got ${users_list.length} users`);
```

### Debug Error

```javascript
try {
  await db.insert(users).values({ name: 'John' });
} catch (error) {
  console.error('Database error:', error.message);
  console.error('Details:', error);
}
```

---

## Common Errors & Fixes

### "Cannot find module 'drizzle-orm'"

```bash
npm install
npm install drizzle-orm drizzle-kit pg
```

### "Database connection refused"

- Check DATABASE_URL in .env
- Verify Neon project exists
- Check IP whitelist (Neon usually allows all)

### "UNIQUE constraint failed"

```javascript
// Check before inserting
const existing = await db.select().from(users)
  .where(eq(users.email, email));

if (existing.length > 0) {
  throw new Error('Email already exists');
}
```

### "Column does not exist"

Run migrations:

```bash
npm run drizzle:generate
npm run drizzle:push
```

---

## File Structure

```
project/
├── .env                      ← Database URL & secrets
├── drizzle.config.ts         ← Drizzle configuration
├── src/
│   ├── index.js              ← Express server
│   ├── db/
│   │   ├── index.ts          ← Database connection
│   │   ├── schema.ts         ← Table definitions
│   │   └── migrations/       ← Auto-generated SQL
│   └── routes/
│       ├── users.js          ← User API endpoints
│       └── courses.js        ← Course API endpoints
└── tutorials/                ← Documentation
    └── postgres_drizzle/
        ├── 00_GETTING_STARTED.md
        ├── 01_MIGRATIONS.md
        ├── 02_CRUD_OPERATIONS.md
        ├── 03_ADVANCED_QUERIES.md
        └── 04_QUICK_REFERENCE.md (this file)
```

---

## Next Steps

1. **Create tables** - Define schema in `src/db/schema.ts`
2. **Generate migrations** - `npm run drizzle:generate`
3. **Apply migrations** - `npm run drizzle:push`
4. **Build APIs** - Create routes in `src/routes/`
5. **Test with cURL** - Test your endpoints
6. **Deploy** - Push to production

---

## Useful Links

- [Drizzle Docs](https://orm.drizzle.team)
- [Neon Docs](https://neon.tech/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs)
- [Node-postgres](https://node-postgres.com)

---

✨ **You're all set to build amazing applications with PostgreSQL & Drizzle!** ✨

---

## 🧭 Navigation

| Link | Direction |
|------|-----------|
| **[← Back to Tutorials](../README.md)** | Overview |
| **[← Previous: 03_ADVANCED_QUERIES.md](./03_ADVANCED_QUERIES.md)** | Complex queries |
| **[Next: 05_USER_REGISTRATION_FLOW.md →](./05_USER_REGISTRATION_FLOW.md)** | Real-world example |

**Learning Path:** 00_GETTING_STARTED → 01_MIGRATIONS → 02_CRUD_OPERATIONS → 03_ADVANCED_QUERIES → 04_QUICK_REFERENCE → 05_USER_REGISTRATION_FLOW
