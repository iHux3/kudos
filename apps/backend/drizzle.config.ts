import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  schema: './apps/backend/src/db/schema/*.ts',
  out: './apps/backend/drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? './kudos.sqlite',
  },
});
