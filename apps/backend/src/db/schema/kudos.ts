import { sql } from 'drizzle-orm';
import { check, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { KUDOS_CATEGORIES } from '@kudos/shared';

export const kudosCategories = KUDOS_CATEGORIES;

export type KudosCategory = (typeof kudosCategories)[number];
const categoryListSql = kudosCategories.map((category) => `'${category}'`).join(', ');

export const kudosTable = sqliteTable(
  'kudos',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    senderId: text('sender_id').notNull(),
    receiverId: text('receiver_id').notNull(),
    message: text('message').notNull(),
    category: text('category', { enum: kudosCategories }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    check(
      'kudos_category_check',
      sql`${table.category} in (${sql.raw(categoryListSql)})`
    ),
  ]
);

export type InsertKudos = typeof kudosTable.$inferInsert;
export type SelectKudos = typeof kudosTable.$inferSelect;
