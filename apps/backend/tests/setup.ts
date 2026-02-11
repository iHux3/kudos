import { mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const testDbPath = path.resolve(here, '../test-output/kudos.test.sqlite');

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = testDbPath;

mkdirSync(path.dirname(testDbPath), { recursive: true });
rmSync(testDbPath, { force: true });

