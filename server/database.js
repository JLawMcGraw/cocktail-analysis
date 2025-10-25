const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'cocktail.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
function initDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Inventory table (user's bar stock)
  db.exec(`
    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create index on user_id for faster lookups
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON inventory(user_id)
  `);

  // Recipes table (user's custom recipes)
  db.exec(`
    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create index on user_id for faster lookups
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id)
  `);

  // Favorites table
  db.exec(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create index on user_id for faster lookups
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id)
  `);

  // History table (ratings, notes, etc.)
  db.exec(`
    CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create index on user_id for faster lookups
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_history_user_id ON history(user_id)
  `);

  console.log('Database initialized successfully');
}

// Initialize database on module load
initDatabase();

// Database query functions (prepare after tables are created)
const userQueries = {
  create: db.prepare(`
    INSERT INTO users (email, password_hash)
    VALUES (?, ?)
  `),

  findByEmail: db.prepare(`
    SELECT id, email, password_hash, created_at
    FROM users
    WHERE email = ?
  `),

  findById: db.prepare(`
    SELECT id, email, created_at
    FROM users
    WHERE id = ?
  `)
};

const inventoryQueries = {
  get: db.prepare(`
    SELECT data
    FROM inventory
    WHERE user_id = ?
    ORDER BY updated_at DESC
    LIMIT 1
  `)
};

// Inventory helpers (handles updates manually since user_id is not unique)
const inventoryHelpers = {
  get: (userId) => {
    return inventoryQueries.get.get(userId);
  },

  save: (userId, data) => {
    const existing = inventoryQueries.get.get(userId);
    if (existing) {
      const updateStmt = db.prepare(`
        UPDATE inventory
        SET data = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `);
      return updateStmt.run(data, userId);
    } else {
      const insertStmt = db.prepare(`
        INSERT INTO inventory (user_id, data)
        VALUES (?, ?)
      `);
      return insertStmt.run(userId, data);
    }
  }
};

const recipesHelpers = {
  get: (userId) => {
    const stmt = db.prepare(`
      SELECT data
      FROM recipes
      WHERE user_id = ?
      ORDER BY updated_at DESC
      LIMIT 1
    `);
    return stmt.get(userId);
  },

  save: (userId, data) => {
    const existing = recipesHelpers.get(userId);
    if (existing) {
      const updateStmt = db.prepare(`
        UPDATE recipes
        SET data = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `);
      return updateStmt.run(data, userId);
    } else {
      const insertStmt = db.prepare(`
        INSERT INTO recipes (user_id, data)
        VALUES (?, ?)
      `);
      return insertStmt.run(userId, data);
    }
  }
};

const favoritesHelpers = {
  get: (userId) => {
    const stmt = db.prepare(`
      SELECT data
      FROM favorites
      WHERE user_id = ?
      ORDER BY updated_at DESC
      LIMIT 1
    `);
    return stmt.get(userId);
  },

  save: (userId, data) => {
    const existing = favoritesHelpers.get(userId);
    if (existing) {
      const updateStmt = db.prepare(`
        UPDATE favorites
        SET data = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `);
      return updateStmt.run(data, userId);
    } else {
      const insertStmt = db.prepare(`
        INSERT INTO favorites (user_id, data)
        VALUES (?, ?)
      `);
      return insertStmt.run(userId, data);
    }
  }
};

const historyHelpers = {
  get: (userId) => {
    const stmt = db.prepare(`
      SELECT data
      FROM history
      WHERE user_id = ?
      ORDER BY updated_at DESC
      LIMIT 1
    `);
    return stmt.get(userId);
  },

  save: (userId, data) => {
    const existing = historyHelpers.get(userId);
    if (existing) {
      const updateStmt = db.prepare(`
        UPDATE history
        SET data = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `);
      return updateStmt.run(data, userId);
    } else {
      const insertStmt = db.prepare(`
        INSERT INTO history (user_id, data)
        VALUES (?, ?)
      `);
      return insertStmt.run(userId, data);
    }
  }
};

module.exports = {
  db,
  initDatabase,
  userQueries,
  inventoryHelpers,
  recipesHelpers,
  favoritesHelpers,
  historyHelpers
};
