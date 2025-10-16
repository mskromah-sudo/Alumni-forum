// backend/migrations/runMigrations.js
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, '..', 'alumni.db');
const MIGRATION_FILE = path.join(__dirname, '20251015_create_moderation_and_audit.sql');

function run() {
  if (!fs.existsSync(MIGRATION_FILE)) {
    console.error('Migration file not found:', MIGRATION_FILE);
    process.exit(1);
  }
  const sql = fs.readFileSync(MIGRATION_FILE, 'utf8');
  const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) { console.error('Open DB error:', err.message); process.exit(1); }
  });
  db.exec('PRAGMA foreign_keys = ON;', (prErr) => {
    if (prErr) { console.error('FK pragma failed:', prErr.message); db.close(); process.exit(1); }
    db.exec(sql, (err) => {
      if (err) { console.error('Migration failed:', err.message); db.close(); process.exit(1); }
      console.log('Migrations applied successfully.');
      db.close();
    });
  });
}

if (require.main === module) run();
module.exports = { run };
