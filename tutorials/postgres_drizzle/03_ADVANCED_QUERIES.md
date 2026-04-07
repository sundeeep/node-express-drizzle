# Advanced Queries & Relationships

Master joins, aggregations, and complex queries with Drizzle.

---


## Relationships Overview

### One-to-Many Relationship

One user can have many enrollments:

```
Users Table              Enrollments Table
┌──────────┐            ┌────────────────────┐
│ id | name│            │ id | userId | ... │
├──────────┤            ├────────────────────┤
│ 1  │John │───────────→│ 1  │   1    │    │
│ 2  │Alice│───┐        │ 2  │   1    │    │
│ 3  │Bob  │   │        │ 3  │   2    │    │
└──────────┘   └────────→│ 4  │   2    │    │
               └────────→│ 5  │   3    │    │
                         └────────────────────┘
```

John (user 1) has 2 enrollments
Alice (user 2) has 2 enrollments
Bob (user 3) has 1 enrollment

---

## JOIN Queries

### Basic JOIN (Two Tables)

Get enrollments with user details:

```javascript
import { db } from './src/db/index.ts';
import { enrollments, users, courses } from './src/db/schema.ts';

// Using query API (Easiest)
const allEnrollments = await db.query.enrollments.findMany({
  with: {
    user: true,   // Include user data
    course: true, // Include course data
  },
});

// Result:
// [
//   {
//     id: 1,
//     userId: 1,
//     courseId: 1,
//     status: 'active',
//     user: { id: 1, name: 'John', email: 'john@example.com', ... },
//     course: { id: 1, title: 'React', instructor: 'Jane', ... }
//   },
//   ...
// ]
```

### LEFT JOIN (Get All with Optional Related)

```javascript
// Get all users, and their enrollments (if any)
const usersWithEnrollments = await db.query.users.findMany({
  with: {
    enrollments: true,
  },
});

// Result:
// [
//   {
//     id: 1,
//     name: 'John',
//     email: 'john@example.com',
//     enrollments: [
//       { id: 1, userId: 1, courseId: 1, status: 'active' },
//       { id: 2, userId: 1, courseId: 2, status: 'completed' }
//     ]
//   },
//   {
//     id: 2,
//     name: 'Alice',
//     email: 'alice@example.com',
//     enrollments: [] // No enrollments
//   }
// ]
```

### Nested Relationships (3+ Tables)

```javascript
// Get courses with all enrollments and their users
const coursesWithStudents = await db.query.courses.findMany({
  with: {
    enrollments: {
      with: {
        user: true, // Include user data for each enrollment
      },
    },
  },
});

// Result:
// [
//   {
//     id: 1,
//     title: 'React',
//     enrollments: [
//       {
//         id: 1,
//         courseId: 1,
//         userId: 1,
//         user: { id: 1, name: 'John', email: 'john@example.com' }
//       },
//       {
//         id: 3,
//         courseId: 1,
//         userId: 2,
//         user: { id: 2, name: 'Alice', email: 'alice@example.com' }
//       }
//     ]
//   }
// ]
```

### JOIN with WHERE Condition

```javascript
// Get specific user with their active enrollments only
const userWithActiveEnrollments = await db.query.users.findFirst({
  where: eq(users.id, 1),
  with: {
    enrollments: {
      where: eq(enrollments.status, 'active'), // Filter enrollments
      with: {
        course: true,
      },
    },
  },
});

// Result:
// {
//   id: 1,
//   name: 'John',
//   enrollments: [
//     { id: 1, status: 'active', course: { ... } },
//     // Only active enrollments shown
//   ]
// }
```

---

## Aggregation Queries

### Count with Grouping

```javascript
// Count enrollments per course
const enrollmentCounts = await db.select({
  courseId: enrollments.courseId,
  count: count(), // Count rows
}).from(enrollments)
  .groupBy(enrollments.courseId);

// Result:
// [
//   { courseId: 1, count: 15 },
//   { courseId: 2, count: 8 },
//   { courseId: 3, count: 20 }
// ]
```

### SUM (Total)

```javascript
// Total progress across all users in a course
const courseProgress = await db.select({
  courseId: enrollments.courseId,
  totalProgress: sum(enrollments.progress),
  avgProgress: avg(enrollments.progress),
}).from(enrollments)
  .groupBy(enrollments.courseId);

// Result:
// [
//   { courseId: 1, totalProgress: 1500, avgProgress: 100 },
//   { courseId: 2, totalProgress: 750, avgProgress: 75 }
// ]
```

### HAVING (Filter Groups)

```javascript
// Get courses with more than 10 enrollments
const popularCourses = await db.select({
  courseId: enrollments.courseId,
  count: count(),
}).from(enrollments)
  .groupBy(enrollments.courseId)
  .having(gt(count(), 10)); // Only groups with count > 10

// Result:
// [
//   { courseId: 1, count: 15 },
//   { courseId: 3, count: 20 }
// ]
```

---

## Subqueries

### Using Subqueries

```javascript
// Get users who have more than 2 enrollments
const subquery = db.select({
  userId: enrollments.userId,
  count: count().as('enrollmentCount'),
}).from(enrollments)
  .groupBy(enrollments.userId)
  .as('enrollment_counts');

const activeUsers = await db.select().from(users)
  .innerJoin(subquery, eq(users.id, subquery.userId))
  .where(gt(subquery.count, 2));
```

---

## Complex Filtering

### IN Operator (Match Any in List)

```javascript
import { inArray } from 'drizzle-orm';

// Get users with specific IDs
const userIds = [1, 3, 5, 7];
const users_list = await db.select().from(users)
  .where(inArray(users.id, userIds));

// Gets users 1, 3, 5, and 7
```

### BETWEEN (Range)

```javascript
import { between } from 'drizzle-orm';

// Get users aged 25-35
const ageGroup = await db.select().from(users)
  .where(between(users.age, 25, 35));
```

### LIKE (Pattern Matching)

```javascript
import { like } from 'drizzle-orm';

// Find emails containing 'gmail'
const gmailUsers = await db.select().from(users)
  .where(like(users.email, '%gmail%'));

// Find names starting with 'John'
const johns = await db.select().from(users)
  .where(like(users.name, 'John%'));
```

### NOT / IS NULL

```javascript
import { isNull, isNotNull, not } from 'drizzle-orm';

// Get users without age set
const noAge = await db.select().from(users)
  .where(isNull(users.age));

// Get users with age set
const withAge = await db.select().from(users)
  .where(isNotNull(users.age));

// Get all courses NOT by 'Jane'
const notJane = await db.select().from(courses)
  .where(not(eq(courses.instructor, 'Jane')));
```

---

## Practical Examples

### Example 1: Get User with Enrollment Stats

```javascript
// Get user + their course stats
const getUserStats = async (userId) => {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      enrollments: {
        with: {
          course: {
            columns: {
              id: true,
              title: true,
              instructor: true,
            },
          },
        },
      },
    },
  });

  if (!user) return null;

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    stats: {
      totalEnrollments: user.enrollments.length,
      activeEnrollments: user.enrollments.filter(e => e.status === 'active').length,
      completedEnrollments: user.enrollments.filter(e => e.status === 'completed').length,
      courses: user.enrollments.map(e => ({
        id: e.course.id,
        title: e.course.title,
        status: e.status,
        progress: e.progress,
      })),
    },
  };
};

const stats = await getUserStats(1);
// {
//   user: { id: 1, name: 'John', email: 'john@example.com' },
//   stats: {
//     totalEnrollments: 3,
//     activeEnrollments: 2,
//     completedEnrollments: 1,
//     courses: [
//       { id: 1, title: 'React', status: 'active', progress: 75 },
//       { id: 2, title: 'Node.js', status: 'active', progress: 50 },
//       { id: 3, title: 'Express', status: 'completed', progress: 100 }
//     ]
//   }
// }
```

### Example 2: Course Leaderboard

```javascript
// Get top students in a course (by progress)
const getCourseLeaderboard = async (courseId, limit = 10) => {
  const leaderboard = await db.select({
    rank: sql`ROW_NUMBER() OVER (ORDER BY ${enrollments.progress} DESC)`,
    userId: enrollments.userId,
    userName: users.name,
    progress: enrollments.progress,
    status: enrollments.status,
  }).from(enrollments)
    .innerJoin(users, eq(enrollments.userId, users.id))
    .where(eq(enrollments.courseId, courseId))
    .orderBy(desc(enrollments.progress))
    .limit(limit);

  return leaderboard;
};

const top10 = await getCourseLeaderboard(1, 10);
// [
//   { rank: 1, userId: 5, userName: 'Alice', progress: 100, status: 'completed' },
//   { rank: 2, userId: 3, userName: 'Bob', progress: 95, status: 'active' },
//   { rank: 3, userId: 1, userName: 'John', progress: 75, status: 'active' }
// ]
```

### Example 3: Find Similar Users

```javascript
// Get users with same interests/courses
const findSimilarUsers = async (userId, limit = 5) => {
  // Get courses this user is in
  const userCourses = await db.select({ courseId: enrollments.courseId })
    .from(enrollments)
    .where(eq(enrollments.userId, userId));

  const courseIds = userCourses.map(c => c.courseId);

  // Find other users in same courses (excluding original user)
  const similarUsers = await db.select({
    userId: enrollments.userId,
    name: users.name,
    email: users.email,
    sharedCourses: count(),
  }).from(enrollments)
    .innerJoin(users, eq(enrollments.userId, users.id))
    .where(and(
      inArray(enrollments.courseId, courseIds),
      not(eq(enrollments.userId, userId))
    ))
    .groupBy(enrollments.userId, users.id, users.name, users.email)
    .orderBy(desc(count()))
    .limit(limit);

  return similarUsers;
};

const similar = await findSimilarUsers(1);
// [
//   { userId: 3, name: 'Bob', email: 'bob@example.com', sharedCourses: 2 },
//   { userId: 5, name: 'Alice', email: 'alice@example.com', sharedCourses: 1 }
// ]
```

---

## Performance Tips

### 1. Select Only What You Need

```javascript
// ❌ Bad - Gets all columns even if you only need name
const users_all = await db.select().from(users);

// ✅ Good - Only get name and email
const users_partial = await db.select({
  name: users.name,
  email: users.email,
}).from(users);
```

### 2. Use Relationships Instead of Multiple Queries

```javascript
// ❌ Bad - 10 separate queries (1 for user + 9 for enrollments)
const user = await db.select().from(users).where(eq(users.id, 1));
const enrollments_list = await db.select().from(enrollments).where(eq(enrollments.userId, 1));

// ✅ Good - 1 query with relationships
const userWithEnrollments = await db.query.users.findFirst({
  where: eq(users.id, 1),
  with: {
    enrollments: true,
  },
});
```

### 3. Filter Before Joining

```javascript
// ❌ Bad - Joins all then filters
const enrollments_all = await db.query.enrollments.findMany({
  with: { course: true },
});
const activeOnly = enrollments_all.filter(e => e.status === 'active');

// ✅ Good - Filter in query
const enrollments_active = await db.query.enrollments.findMany({
  where: eq(enrollments.status, 'active'),
  with: { course: true },
});
```

### 4. Use Limit for Large Datasets

```javascript
// ❌ Bad - Gets ALL users (could be millions)
const all = await db.select().from(users);

// ✅ Good - Get first 100
const paginated = await db.select().from(users).limit(100);
```

---

## SQL Generated

See what SQL Drizzle generates (helpful for understanding):

```javascript
// Enable logging in your config
// drizzle.config.ts: logSql: true

// Or use sql tag directly
import { sql } from 'drizzle-orm';

const customQuery = await db.select()
  .from(users)
  .where(sql`age > ${25}`);
```

---

## Summary

✅ Join tables with relationships
✅ Aggregate data (count, sum, avg)
✅ Use subqueries for complex logic
✅ Filter with IN, BETWEEN, LIKE, NULL
✅ Build practical features (leaderboards, stats)
✅ Optimize with selective queries

You're now ready for advanced database operations! 🚀

---

## 🧭 Navigation

| Link | Direction |
|------|-----------|
| **[← Back to Tutorials](../README.md)** | Overview |
| **[← Previous: 02_CRUD_OPERATIONS.md](./02_CRUD_OPERATIONS.md)** | Basic operations |
| **[Next: 04_QUICK_REFERENCE.md →](./04_QUICK_REFERENCE.md)** | Handy cheat sheet |

**Learning Path:** 00_GETTING_STARTED → 01_MIGRATIONS → 02_CRUD_OPERATIONS → 03_ADVANCED_QUERIES → 04_QUICK_REFERENCE → 05_USER_REGISTRATION_FLOW
