/**
 * Database Connection and Setup
 * SQLite database for Cocktail Analyzer
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Database file path
const DB_PATH = path.join(__dirname, 'cocktail-analyzer.db');

// Initialize database connection
let db = null;

/**
 * Get database connection
 */
function getDB() {
  if (db) {
    return db;
  }

  db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('❌ Error opening database:', err.message);
      process.exit(1);
    }
    console.log('📊 Connected to SQLite database at:', DB_PATH);
  });

  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON;');

  return db;
}

/**
 * Initialize database with schema
 */
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const db = getDB();
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    db.exec(schema, (err) => {
      if (err) {
        console.error('❌ Error initializing database schema:', err.message);
        reject(err);
      } else {
        console.log('✅ Database schema initialized successfully');
        resolve();
      }
    });
  });
}

/**
 * Close database connection
 */
function closeDB() {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          console.error('❌ Error closing database:', err.message);
          reject(err);
        } else {
          console.log('📊 Database connection closed');
          db = null;
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
}

/**
 * Run a query that returns all rows
 */
function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    const db = getDB();
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

/**
 * Run a query that returns a single row
 */
function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    const db = getDB();
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

/**
 * Run a query that modifies data (INSERT, UPDATE, DELETE)
 */
function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    const db = getDB();
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
}

module.exports = {
  getDB,
  initializeDatabase,
  closeDB,
  dbAll,
  dbGet,
  dbRun,
};
