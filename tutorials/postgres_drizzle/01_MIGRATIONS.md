# Database Migrations Guide

Master the art of managing database schema changes safely.

---

## What Are Migrations?

A migration is a versioned SQL file that describes how to update your database schema.

### Why Migrations?

```
Without Migrations (❌ Chaos):
- Developer 1 changes schema on local DB
- Developer 2 has different schema
- Different schemas in dev, staging, production
- Data loss, broken queries, deployments fail

With Migrations (✅ Order):
- Schema changes are tracked in version control
- Everyone gets the same schema
- Changes can be rolled back
- Production is always in sync
```

---

## Migration Workflow

### Step 1: Make Schema Changes

**File: `src/db/schema.ts`**

```typescript
// Add a new column to users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 20 }), // ← NEW!
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
});
```

### Step 2: Generate Migration File

```bash
npm run drizzle:generate
```

**Output:**
```
✓ Generated migration: src/db/migrations/0001_square_deadpool.sql
```

**Generated SQL (auto-created):**
```sql
ALTER TABLE "users" ADD COLUMN "phone" varchar(20);
```

### Step 3: Review & Validate

Always check the generated migration before applying:

```bash
cat src/db/migrations/0001_square_deadpool.sql
```

### Step 4: Apply to Database

```bash
npm run drizzle:push
```

**Output:**
```
✓ Drizzle studio is available at http://localhost:5555
✓ Applying migrations...
✓ Applied migrations successfully!
```

---

## Common Migration Scenarios

### Scenario 1: Add a New Column

**Schema Change:**
```typescript
export const users = pgTable('users', {
  // ... existing columns
  bio: text('bio'), // ← NEW
});
```

**Generated Migration:**
```sql
ALTER TABLE "users" ADD COLUMN "bio" text;
```

### Scenario 2: Add Not-Null Column (With Default)

**Schema Change:**
```typescript
export const users = pgTable('users', {
  // ... existing columns
  status: varchar('status', { length: 50 }).notNull().default('active'), // ← NEW
});
```

**Generated Migration:**
```sql
ALTER TABLE "users" ADD COLUMN "status" varchar(50) NOT NULL DEFAULT 'active';
```

### Scenario 3: Make Column Unique

**Schema Change:**
```typescript
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(), // ← Added .unique()
});
```

**Generated Migration:**
```sql
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");
```

### Scenario 4: Rename Column

```typescript
// Old name: userName
// New name: fullName

export const users = pgTable('users', {
  fullName: varchar('full_name', { length: 255 }).notNull(), // ← Changed
});
```

**Generated Migration:**
```sql
ALTER TABLE "users" RENAME COLUMN "user_name" TO "full_name";
```

### Scenario 5: Change Column Type

```typescript
export const users = pgTable('users', {
  age: varchar('age'), // ← Was integer, now varchar
});
```

**Generated Migration:**
```sql
ALTER TABLE "users" ALTER COLUMN "age" TYPE varchar;
```

### Scenario 6: Create New Table

**Schema Change:**
```typescript
export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content'),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
});
```

**Generated Migration:**
```sql
CREATE TABLE "posts" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL,
  "title" varchar(255) NOT NULL,
  "content" text,
  "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
);
```


---

## Migration Files Structure

### File Naming

```
src/db/migrations/
├── 0000_lazy_initial_tables.sql     ← First migration (initial schema)
├── 0001_square_deadpool.sql         ← Second migration (add phone column)
├── 0002_breezy_magneto.sql          ← Third migration (add posts table)
└── meta/
    ├── _journal.json                ← Migration history
    ├── 0000_snapshot.json           ← Schema snapshot at each migration
    ├── 0001_snapshot.json
    └── 0002_snapshot.json
```

### Migration File Content

**File: `0001_square_deadpool.sql`**

```sql
-- Migration: Add phone column to users
-- Timestamp: 2024-01-15T10:30:00.000Z

ALTER TABLE "users" ADD COLUMN "phone" varchar(20);
```

---

## Viewing Migration History

### See All Applied Migrations

```bash
cat src/db/migrations/meta/_journal.json
```

**Output:**
```json
{
  "version": "6",
  "dialect": "postgresql",
  "entries": [
    {
      "idx": 0,
      "version": "5",
      "when": 1705316400000,
      "tag": "0000_lazy_initial_tables",
      "breakpoints": false
    },
    {
      "idx": 1,
      "version": "5",
      "when": 1705320000000,
      "tag": "0001_square_deadpool",
      "breakpoints": false
    }
  ]
}
```

---

## Safe Migration Practices

### ✅ DO: Test Locally First

```bash
# Test on local/staging database
npm run drizzle:push

# Verify data integrity
npm run drizzle:studio
```

### ✅ DO: Review Generated SQL

Always check the migration file before applying:

```bash
# Look at your migration file
nano src/db/migrations/0001_square_deadpool.sql
```

### ✅ DO: Commit Migrations to Git

```bash
git add src/db/migrations/
git commit -m "Add phone column to users table"
```

### ❌ DON'T: Manually Edit Migration Files

Let Drizzle generate them. Manual edits can cause issues.

### ❌ DON'T: Run Multiple Schema Changes Without Generating

```bash
# WRONG ❌
// Change schema 5 times
npm run drizzle:generate // Only generates for last change
npm run drizzle:push

# RIGHT ✅
// Change schema once
npm run drizzle:generate // Generates migration
npm run drizzle:push      // Apply
// Change schema again
npm run drizzle:generate
npm run drizzle:push
```

---

## Troubleshooting Migrations

### Problem: "No changes detected"

**Cause:** Schema file matches database

**Solution:**
```bash
# Make sure you actually changed the schema
# Then save the file
npm run drizzle:generate
```

### Problem: "Migration conflicts"

**Cause:** Two developers created different migrations

**Solution:**
```bash
# Ask your team which migration is correct
# Delete the wrong migration file
# Regenerate if needed
npm run drizzle:generate
npm run drizzle:push
```

### Problem: "Failed to apply migration"

**Cause:** Migration conflicts with data or constraints

**Example:**
```sql
-- Migration tries to:
ALTER TABLE "users" ADD COLUMN "email" NOT NULL;
-- But some users already exist without email values!
-- ERROR: Column must be NOT NULL but existing rows have NULL
```

**Solution:** Provide a default value

```typescript
// Update schema to have a default
email: varchar('email', { length: 255 })
  .notNull()
  .default('noemail@example.com'), // ← Provide default
```

---

## Advanced: Writing Custom Migrations

Sometimes you need to write custom SQL migrations for complex operations.

**File: `src/db/migrations/0002_custom_migration.sql`**

```sql
-- Add column with computed value
ALTER TABLE "users" ADD COLUMN "full_name" varchar(255);

-- Update existing rows
UPDATE "users" SET "full_name" = CONCAT(first_name, ' ', last_name);

-- Make it NOT NULL
ALTER TABLE "users" ALTER COLUMN "full_name" SET NOT NULL;

-- Add unique constraint
ALTER TABLE "users" ADD CONSTRAINT "users_full_name_unique" UNIQUE("full_name");
```

Then apply:
```bash
npm run drizzle:push
```

---

## Migration Commands Quick Reference

```bash
# Generate migration from schema changes
npm run drizzle:generate

# Apply migrations to database
npm run drizzle:push

# View migrations in UI
npm run drizzle:studio

# Drop all data (WARNING! ⚠️ Resets everything)
npm run drizzle:drop
```

---

## Summary

✅ Change schema in `src/db/schema.ts`
✅ Generate migration with `npm run drizzle:generate`
✅ Review the generated SQL file
✅ Apply with `npm run drizzle:push`
✅ Commit migrations to git
✅ Share with team so everyone stays in sync

Migrations = Version control for your database schema! 🎉

---

## 🧭 Navigation

| Link | Direction |
|------|-----------|
| **[← Back to Tutorials](../README.md)** | Overview |
| **[← Previous: 00_GETTING_STARTED.md](./00_GETTING_STARTED.md)** | Foundations |
| **[Next: 02_CRUD_OPERATIONS.md →](./02_CRUD_OPERATIONS.md)** | Data manipulation |

**Learning Path:** 00_GETTING_STARTED → 01_MIGRATIONS → 02_CRUD_OPERATIONS → 03_ADVANCED_QUERIES → 04_QUICK_REFERENCE → 05_USER_REGISTRATION_FLOW
