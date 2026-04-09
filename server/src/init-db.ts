import { initDatabase } from './db.js';

async function run() {
  try {
    await initDatabase();
    process.exit(0);
  } catch (err) {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  }
}

run();
