import {
  pgTable,      // Function to define a PostgreSQL table
  serial,       // Auto-incrementing integer (1, 2, 3...)
  text,         // Variable-length string
  numeric,      // Exact decimal number (good for money)
  boolean,      // true or false
  timestamp,    // Date + time
} from 'drizzle-orm/pg-core';

export const courses = pgTable('courses', {
  // PRIMARY KEY
  // serial = auto-increment. First row gets 1, second gets 2, etc.
  // primaryKey() = this column uniquely identifies each row
  id: serial('id').primaryKey(),

  // TEXT COLUMNS
  // .notNull() = this field is required. Empty value will be rejected by the DB.
  name: text('name').notNull(),

  description: text('description').notNull(),

  instructor: text('instructor').notNull(),

  // NUMERIC
  // precision: total number of digits (e.g., 9999999.99 = 10 digits)
  // scale: digits after decimal point (2 = cents) // TODO:
  price: numeric('price', { precision: 5, scale: 2 }).notNull(),

  // BOOLEAN
  // .default(false) means if you don't provide this value, the DB uses false
  // New courses start as drafts by default
  isPublished: boolean('is_published').default(false).notNull(),

  // TIMESTAMPS
  // new Date() is called when the row is created — sets the current time
  createdAt: timestamp('created_at').defaultNow().notNull(),

  // updatedAt will be managed manually in our service layer
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});