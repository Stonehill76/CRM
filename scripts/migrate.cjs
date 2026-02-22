'use strict';

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.join(__dirname, '..', 'crm.db');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Create migrations tracking table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS _migrations (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT    NOT NULL UNIQUE,
    run_at   TEXT    NOT NULL DEFAULT (datetime('now'))
  )
`);

// Read all .sql files from migrations/ in numeric order
const migrationFiles = fs
  .readdirSync(MIGRATIONS_DIR)
  .filter(f => f.endsWith('.sql'))
  .sort(); // lexicographic sort keeps 001_, 002_, 003_ in order

// Fetch already-applied migrations
const applied = new Set(
  db.prepare('SELECT filename FROM _migrations').all().map(r => r.filename)
);

let appliedCount = 0;

for (const filename of migrationFiles) {
  if (applied.has(filename)) {
    console.log(`  skip  ${filename} (already applied)`);
    continue;
  }

  const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, filename), 'utf8');

  // Run the entire migration file in a single transaction
  db.transaction(() => {
    db.exec(sql);
    db.prepare('INSERT INTO _migrations (filename) VALUES (?)').run(filename);
  })();

  console.log(`  apply ${filename}`);
  appliedCount++;
}

if (appliedCount === 0) {
  console.log('No pending migrations.');
} else {
  console.log(`\nDone — ${appliedCount} migration(s) applied.`);
}

db.close();
