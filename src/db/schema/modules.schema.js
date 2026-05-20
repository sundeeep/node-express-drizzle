import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core';
import { courses } from './course.schema';

export const modules = pgTable('modules', {
  id: serial('id').primaryKey(),

  // FOREIGN KEY
  // This is how we link a module to its course.
  // references(() => courses.id) tells Drizzle:
  //   "this column must match an existing id in the courses table"
  // onDelete: 'cascade' means:
  //   "if the course is deleted, automatically delete all its modules too"
  //   Without this, trying to delete a course with modules would throw an error.
  courseId: integer('course_id')
    .notNull()
    .references(() => courses.id, { onDelete: 'cascade' }),

  title: text('title').notNull(),

  // ORDER
  // Modules inside a course have a position: Module 1, Module 2, etc.
  // This integer tracks that order.
  order: integer('order').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});