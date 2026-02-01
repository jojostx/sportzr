import 'dotenv/config';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

// 1. Determine the path dynamically
const dbPath = process.env.DATABASE_URL || 'sqlite.db';

// 2. Warn if falling back to default
if (!process.env.DATABASE_URL) {
    console.warn(`Warning: DATABASE_URL not found. Using default file: "${dbPath}"`);
}

// 3. Initialize with the dynamic path
const sqlite = new Database(dbPath);
const db = drizzle(sqlite); 

export { db };