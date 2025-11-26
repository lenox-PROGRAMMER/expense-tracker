// Use require to avoid TypeScript errors when @types/better-sqlite3 can't be installed.
const Database: any = require("better-sqlite3");

export function initDb() {
  const db = new Database("./data/expenses.db");

  // Create tables if they don't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS auth_lock (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      pin_hash TEXT,
      enabled INTEGER DEFAULT 0
    );
  `);

  return db;
}
