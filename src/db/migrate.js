import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from './db.js'; // Point this to where you initialize your db
import config from '../../drizzle.config.js'; // Point to your config to get the output path

// This will run all migrations in the folder specified in your config
// If you didn't define 'out' in config, default is './drizzle'
const migrationsFolder = config.out || './drizzle';

try {
  migrate(db, { migrationsFolder });
  console.log('✅ Migrations completed!');
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
}