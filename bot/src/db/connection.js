const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const env = require('../config/env');

function ensureDatabaseDirectory() {
  fs.mkdirSync(path.dirname(env.database.path), { recursive: true });
}

function createDatabaseConnection() {
  ensureDatabaseDirectory();

  // Node 24 já traz SQLite nativo. Isso evita compilar dependências como better-sqlite3 no Windows.
  const db = new DatabaseSync(env.database.path);

  // Foreign keys não vêm sempre ativas no SQLite. Ativamos para proteger relacionamentos como membro -> departamento.
  db.exec('PRAGMA foreign_keys = ON');
  return db;
}

module.exports = { createDatabaseConnection };
