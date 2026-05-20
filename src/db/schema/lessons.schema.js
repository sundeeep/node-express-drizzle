import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core';
import { modules } from './module.schema';

export const lessons = pgTable('lessons', {
  id: serial('id').primaryKey(),

  // FOREIGN KEY to modules
  // A lesson belongs to exactly one module
  moduleId: integer('module_id')
    .notNull()
    .references(() => modules.id, { onDelete: 'cascade' }),

  title: text('title').notNull(),

  // content is optional — maybe some lessons are video-only
  // No .notNull() means it can be null (empty)
  content: text('content'),

  // Optional YouTube/Vimeo URL for the lesson video
  videoUrl: text('video_url'),

  order: integer('order').notNull(),

  // How long is this lesson? In minutes.
  durationMinutes: integer('duration_minutes'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});