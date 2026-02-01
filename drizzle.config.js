import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

if (!process.env.DATABASE_URL) {
    console.warn('Warning: DATABASE_URL not found. Using default SQLite database at "sqlite.db"');
}

export default defineConfig({
    schema: './src/db/schema.js',
    out: './src/db/migrations',
    dialect: 'sqlite',
    dbCredentials: {
        url: process.env.DATABASE_URL || 'sqlite.db',
    },
});