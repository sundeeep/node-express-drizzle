# CRUD Operations - Complete Guide

Learn to Create, Read, Update, and Delete data with Drizzle ORM.

---


## What is CRUD?

CRUD is the foundation of database operations:

| Operation | SQL | Purpose |
|-----------|-----|---------|
| **C**reate | INSERT | Add new data |
| **R**ead | SELECT | Retrieve data |
| **U**pdate | UPDATE | Modify existing data |
| **D**elete | DELETE | Remove data |

---

## Setup

All examples use this import:

```javascript
import { db } from './src/db/index.ts';
import { users, courses, enrollments } from './src/db/schema.ts';
import { eq, gt, lt, and, or } from 'drizzle-orm';
```

---

## CREATE - Insert Data

### Insert Single Record

```javascript
// Add one user
const newUser = await db.insert(users).values({
  name: 'John Doe',
  email: 'john@example.com',
  age: 28,
});

// Returns: Result object (empty by default)
```

### Get Return Value

```javascript
// Insert and get the new record back
const newUser = await db.insert(users).values({
  name: 'John Doe',
  email: 'john@example.com',
  age: 28,
}).returning();

// Returns: [{ id: 1, name: 'John Doe', email: 'john@example.com', age: 28, createdAt: ... }]

console.log(newUser[0].id); // Get the new ID
```

### Insert Multiple Records

```javascript
// Add multiple users at once
const newUsers = await db.insert(users).values([
  {
    name: 'Alice',
    email: 'alice@example.com',
    age: 25,
  },
  {
    name: 'Bob',
    email: 'bob@example.com',
    age: 30,
  },
  {
    name: 'Charlie',
    email: 'charlie@example.com',
    age: 35,
  },
]).returning();

console.log(`Created ${newUsers.length} users`);
```

### Insert with Default Values

```javascript
// Fields without values use their defaults
const newUser = await db.insert(users).values({
  name: 'Sarah',
  email: 'sarah@example.com',
  // age not provided - will be NULL
  // createdAt not provided - will use CURRENT_TIMESTAMP
}).returning();
```

### Conditional Insert (If Not Exists)

```javascript
// Check first if email exists
const existing = await db.select().from(users).where(eq(users.email, 'john@example.com'));

if (existing.length === 0) {
  // Only insert if not found
  await db.insert(users).values({
    name: 'John',
    email: 'john@example.com',
  });
}
```

---

## READ - Query Data

### Get All Records

```javascript
// Get all users
const allUsers = await db.select().from(users);

// Result:
// [
//   { id: 1, name: 'John', email: 'john@example.com', age: 28, ... },
//   { id: 2, name: 'Alice', email: 'alice@example.com', age: 25, ... },
//   { id: 3, name: 'Bob', email: 'bob@example.com', age: 30, ... }
// ]
```

### Get Specific Columns Only

```javascript
// Get only names and emails (lighter query)
const users_list = await db.select({
  name: users.name,
  email: users.email,
}).from(users);

// Result:
// [
//   { name: 'John', email: 'john@example.com' },
//   { name: 'Alice', email: 'alice@example.com' },
// ]
```

### Get One Record by ID

```javascript
// Find user by ID
const user = await db.select().from(users).where(eq(users.id, 1));

// user is an array, so access first element
if (user.length > 0) {
  console.log(user[0].name); // "John"
}

// Or use a helper function
const getUserById = async (id) => {
  const user = await db.select().from(users).where(eq(users.id, id));
  return user[0] || null; // Return first user or null
};

const john = await getUserById(1);
```

### Get One Record by Unique Column

```javascript
// Find user by email
const user = await db.select()
  .from(users)
  .where(eq(users.email, 'john@example.com'));

const john = user[0]; // Get first (only) result
```

### Filter with WHERE

```javascript
import { gt, lt, and, or } from 'drizzle-orm';

// Greater than (age > 25)
const olderUsers = await db.select()
  .from(users)
  .where(gt(users.age, 25));

// Less than (age < 30)
const youngerUsers = await db.select()
  .from(users)
  .where(lt(users.age, 30));

// Multiple conditions - AND (age > 25 AND age < 35)
const middleAged = await db.select()
  .from(users)
  .where(and(
    gt(users.age, 25),
    lt(users.age, 35)
  ));

// Multiple conditions - OR (email OR name match)
const matches = await db.select()
  .from(users)
  .where(or(
    eq(users.email, 'john@example.com'),
    eq(users.name, 'Alice')
  ));
```

### Sorting (ORDER BY)

```javascript
// Sort ascending (A-Z, 0-9, oldest first)
const usersByName = await db.select()
  .from(users)
  .orderBy(users.name); // Default is ascending

// Sort descending (Z-A, 9-0, newest first)
const newestUsers = await db.select()
  .from(users)
  .orderBy(desc(users.createdAt)); // Import desc

// Sort by multiple columns
const sorted = await db.select()
  .from(users)
  .orderBy(users.age, users.name); // Age first, then name
```

### Limit & Offset (Pagination)

```javascript
// Get first 10 users
const firstPage = await db.select()
  .from(users)
  .limit(10);

// Get next 10 users (skip first 10)
const secondPage = await db.select()
  .from(users)
  .limit(10)
  .offset(10);

// Pagination helper
const paginate = async (page = 1, pageSize = 10) => {
  const offset = (page - 1) * pageSize;
  return db.select()
    .from(users)
    .limit(pageSize)
    .offset(offset);
};

const page2Users = await paginate(2, 10);
```

### Count Records

```javascript
import { count } from 'drizzle-orm';

// Count all users
const result = await db.select({ count: count() }).from(users);
const totalUsers = result[0].count; // e.g., 25

// Count with condition
const adultCount = await db.select({ count: count() })
  .from(users)
  .where(gt(users.age, 18));

const totalAdults = adultCount[0].count;
```

### Distinct Values

```javascript
import { sql } from 'drizzle-orm';

// Get unique instructor names (no duplicates)
const instructors = await db.select({ instructor: courses.instructor })
  .from(courses)
  .distinct();

// Result: [{ instructor: 'Jane' }, { instructor: 'Bob' }]
// (Even if 5 courses have same instructor, shows only once)
```

---

## UPDATE - Modify Data

### Update Single Field

```javascript
// Change user's age
await db.update(users)
  .set({ age: 29 })
  .where(eq(users.id, 1));

// Database now: User 1 has age 29
```

### Update Multiple Fields

```javascript
// Change name and age
await db.update(users)
  .set({
    name: 'John Updated',
    age: 30,
  })
  .where(eq(users.id, 1));
```

### Update Multiple Records

```javascript
// Make all users in a course inactive
await db.update(enrollments)
  .set({ status: 'dropped' })
  .where(eq(enrollments.courseId, 5));

// All enrollments for course 5 now have status 'dropped'
```

### Update with Condition (Update Multiple)

```javascript
// Increase age for users older than 30
await db.update(users)
  .set({ age: sql`age + 1` })
  .where(gt(users.age, 30));

// Users 31 → 32, 35 → 36, etc.
```

### Get Updated Records

```javascript
// Update and see the result
const updated = await db.update(users)
  .set({ age: 30 })
  .where(eq(users.id, 1))
  .returning();

console.log(updated[0]); // { id: 1, name: 'John', age: 30, ... }
```

---

## DELETE - Remove Data

### Delete Single Record

```javascript
// Remove user by ID
await db.delete(users).where(eq(users.id, 1));

// User 1 is gone from database
```

### Delete Multiple Records

```javascript
// Remove all users over 60 years old
await db.delete(users).where(gt(users.age, 60));
```

### Delete with Multiple Conditions

```javascript
// Delete inactive enrollments from a specific course
await db.delete(enrollments)
  .where(and(
    eq(enrollments.courseId, 5),
    eq(enrollments.status, 'dropped')
  ));
```

### Get Deleted Records

```javascript
// Delete and return what was deleted
const deleted = await db.delete(users)
  .where(eq(users.id, 1))
  .returning();

console.log(deleted[0]); // The deleted user's data
```

---

## Real-World Examples

### Example 1: Create & Enroll User in Course

```javascript
// 1. Create new user
const newUsers = await db.insert(users).values({
  name: 'Sarah',
  email: 'sarah@example.com',
  age: 28,
}).returning();

const userId = newUsers[0].id;

// 2. Enroll them in course
await db.insert(enrollments).values({
  userId: userId,
  courseId: 1,
  status: 'active',
}).returning();

console.log('✅ User created and enrolled!');
```

### Example 2: Get User's Progress

```javascript
const getUserProgress = async (userId) => {
  // Get all enrollments for user
  const enrollments = await db.select()
    .from(enrollments)
    .where(eq(enrollments.userId, userId));

  // For each enrollment, calculate progress
  const progress = enrollments.map(e => ({
    courseId: e.courseId,
    status: e.status,
    progress: e.progress, // 0-100%
  }));

  return progress;
};
```

### Example 3: Update Enrollment Status

```javascript
const completeEnrollment = async (enrollmentId) => {
  const completed = await db.update(enrollments)
    .set({
      status: 'completed',
      completedAt: new Date(),
      progress: 100,
    })
    .where(eq(enrollments.id, enrollmentId))
    .returning();

  return completed[0];
};
```

### Example 4: Search Users

```javascript
const searchUsers = async (query) => {
  // Case-insensitive search in name or email
  const results = await db.select()
    .from(users)
    .where(or(
      like(users.name, `%${query}%`),
      like(users.email, `%${query}%`)
    ));

  return results;
};

// Usage
const matches = await searchUsers('john');
```

---

## Common Patterns

### Soft Delete (Don't Actually Delete)

Instead of deleting, mark as inactive:

```javascript
// Schema: add deletedAt column
export const users = pgTable('users', {
  // ... other fields
  deletedAt: timestamp('deleted_at'), // NULL = active, has value = deleted
});

// "Delete" by setting deletedAt
await db.update(users)
  .set({ deletedAt: new Date() })
  .where(eq(users.id, 1));

// Query only active users
const activeUsers = await db.select()
  .from(users)
  .where(isNull(users.deletedAt));
```

### Bulk Operations

```javascript
// Insert many records efficiently
const userData = [
  { name: 'User 1', email: 'user1@example.com' },
  { name: 'User 2', email: 'user2@example.com' },
  { name: 'User 3', email: 'user3@example.com' },
];

const created = await db.insert(users).values(userData).returning();
console.log(`Created ${created.length} users`);
```

---

## Commands Quick Reference

```javascript
// CREATE
db.insert(table).values({ field: value }).returning()

// READ
db.select().from(table)
db.select().from(table).where(condition)
db.select().from(table).orderBy(field)
db.select().from(table).limit(10)

// UPDATE
db.update(table).set({ field: newValue }).where(condition).returning()

// DELETE
db.delete(table).where(condition).returning()
```

---

## Summary

✅ INSERT - Add new records
✅ SELECT - Query existing records
✅ UPDATE - Modify records
✅ DELETE - Remove records
✅ WHERE - Filter records
✅ ORDER BY - Sort results
✅ LIMIT/OFFSET - Paginate results

You now have all the tools for complete CRUD operations! 🎯

---

## 🧭 Navigation

| Link | Direction |
|------|-----------|
| **[← Back to Tutorials](../README.md)** | Overview |
| **[← Previous: 01_MIGRATIONS.md](./01_MIGRATIONS.md)** | Schema management |
| **[Next: 03_ADVANCED_QUERIES.md →](./03_ADVANCED_QUERIES.md)** | Complex operations |

**Learning Path:** 00_GETTING_STARTED → 01_MIGRATIONS → 02_CRUD_OPERATIONS → 03_ADVANCED_QUERIES → 04_QUICK_REFERENCE → 05_USER_REGISTRATION_FLOW
