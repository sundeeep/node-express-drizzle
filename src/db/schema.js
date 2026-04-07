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
  // Primary key - auto-incrementing ID
  id: serial('id').primaryKey(),

  // User's full name (required, max 255 chars)
  name: varchar('name', { length: 255 }).notNull(),

  // User's email (required, unique, max 255 chars)
  email: varchar('email', { length: 255 }).notNull().unique(),

  // User's age (optional)
  age: integer('age'),

  // When the user was created (auto-set)
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
});

/**
 * COURSES TABLE
 * Stores course information
 */
export const courses = pgTable('courses', {
  // Primary key - auto-incrementing ID
  id: serial('id').primaryKey(),

  // Course title (required)
  title: varchar('title', { length: 255 }).notNull(),

  // Course description (optional, longer text)
  description: text('description'),

  // Instructor name (required)
  instructor: varchar('instructor', { length: 255 }).notNull(),

  // Course difficulty level (optional)
  level: varchar('level', { length: 50 }), // 'beginner', 'intermediate', 'advanced'

  // When course was created (auto-set)
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),

  // When course was last updated
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

/**
 * ENROLLMENTS TABLE
 * Links users to courses (Many-to-Many relationship)
 * Example: User 1 enrolled in Course 1 and Course 2
 */
export const enrollments = pgTable('enrollments', {
  // Primary key
  id: serial('id').primaryKey(),

  // Foreign key to users table
  // If user is deleted, their enrollments are deleted too (onDelete: 'cascade')
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  // Foreign key to courses table
  // If course is deleted, its enrollments are deleted too
  courseId: integer('course_id')
    .notNull()
    .references(() => courses.id, { onDelete: 'cascade' }),

  // Enrollment status (active, completed, dropped, etc)
  status: varchar('status', { length: 50 }).default('active'), // 'active', 'completed', 'dropped'

  // When they enrolled
  enrolledAt: timestamp('enrolled_at').default(sql`CURRENT_TIMESTAMP`),

  // When they completed (if they did)
  completedAt: timestamp('completed_at'),

  // Progress percentage (0-100)
  progress: integer('progress').default(0),
});

/**
 * LESSONS TABLE
 * Stores individual lessons within courses
 */
export const lessons = pgTable('lessons', {
  id: serial('id').primaryKey(),

  // Which course this lesson belongs to
  courseId: integer('course_id')
    .notNull()
    .references(() => courses.id, { onDelete: 'cascade' }),

  // Lesson title
  title: varchar('title', { length: 255 }).notNull(),

  // Lesson content
  content: text('content'),

  // Order of lesson in course (1st lesson, 2nd lesson, etc)
  orderIndex: integer('order_index').notNull(),

  // Duration in minutes
  duration: integer('duration'), // in minutes

  // Is this lesson published? (drafts, published lessons)
  isPublished: boolean('is_published').default(false),

  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
});

/**
 * LESSONS PROGRESS TABLE
 * Tracks user progress on individual lessons
 */
export const lessonsProgress = pgTable('lessons_progress', {
  id: serial('id').primaryKey(),

  // Which user
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  // Which lesson
  lessonId: integer('lesson_id')
    .notNull()
    .references(() => lessons.id, { onDelete: 'cascade' }),

  // Is lesson completed
  isCompleted: boolean('is_completed').default(false),

  // When completed
  completedAt: timestamp('completed_at'),

  // When started viewing
  startedAt: timestamp('started_at').default(sql`CURRENT_TIMESTAMP`),
});

/**
 * RELATIONSHIPS
 * These define the connections between tables for easier querying
 */

// User can have many enrollments
export const usersRelations = relations(users, ({ many }) => ({
  enrollments: many(enrollments),
  lessonsProgress: many(lessonsProgress),
}));

// Course can have many enrollments
export const coursesRelations = relations(courses, ({ many }) => ({
  enrollments: many(enrollments),
  lessons: many(lessons),
}));

// Enrollment belongs to one user and one course
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

// Lesson belongs to one course
export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  course: one(courses, {
    fields: [lessons.courseId],
    references: [courses.id],
  }),
  progress: many(lessonsProgress),
}));

// Lesson progress belongs to user and lesson
export const lessonsProgressRelations = relations(lessonsProgress, ({ one }) => ({
  user: one(users, {
    fields: [lessonsProgress.userId],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [lessonsProgress.lessonId],
    references: [lessons.id],
  }),
}));
