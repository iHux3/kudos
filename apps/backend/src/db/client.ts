import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'node:path';
import * as schema from './schema';

console.log("XXX", process.env.NODE_ENV);
console.log("XXX", process.env.DATABASE_URL);

const databaseUrl = process.env.DATABASE_URL ?? 'kudos.sqlite'

const sqlite = new Database(databaseUrl);

export const db = drizzle(sqlite, { schema });

const migrationsFolder = process.env.DRIZZLE_MIGRATIONS_DIR
  ? path.resolve(process.env.DRIZZLE_MIGRATIONS_DIR)
  : path.resolve(__dirname, '../../drizzle');

export const runMigrations = () => {
  migrate(db, {
    migrationsFolder,
  });
};

export const closeDb = () => {
  sqlite.close();
};

export const getDb = (url: string) => {
  const sqlite = new Database(url);
  return drizzle(sqlite, { schema });
};