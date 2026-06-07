const fs = require('fs');
const path = require('path');
const { createDatabaseConnection } = require('./connection');

const migrationsDir = path.join(__dirname, 'migrations');

function ensureMigrationsTable(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

function getAppliedMigrations(db) {
  const rows = db.prepare('SELECT filename FROM schema_migrations').all();
  return new Set(rows.map((row) => row.filename));
}

function runMigrations() {
  const db = createDatabaseConnection();
  ensureMigrationsTable(db);

  const applied = getAppliedMigrations(db);
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  for (const file of files) {
    if (applied.has(file)) {
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

    try {
      db.exec('BEGIN');
      db.exec(sql);
      db.prepare('INSERT INTO schema_migrations (filename) VALUES (?)').run(file);
      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }

    console.log(`Migration aplicada: ${file}`);
  }

  console.log('Banco MyFeedback atualizado.');
  db.close();
}

runMigrations();
