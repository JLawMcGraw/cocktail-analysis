-- Cocktail Analyzer Database Schema
-- SQLite Database

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Inventory items (user's bar stock)
CREATE TABLE IF NOT EXISTS inventory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  liquor_type TEXT,
  name TEXT NOT NULL,
  stock_number INTEGER DEFAULT 1,
  detailed_classification TEXT,
  distillation_method TEXT,
  abv TEXT,
  distillery_location TEXT,
  age_statement TEXT,
  additional_notes TEXT,
  profile_nose TEXT,
  palate TEXT,
  finish TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for faster user inventory lookups
CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON inventory(user_id);

-- Recipes (user's recipe collection)
CREATE TABLE IF NOT EXISTS recipes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  ingredients TEXT NOT NULL,
  instructions TEXT,
  glass TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for faster user recipe lookups
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id);

-- Favorites
CREATE TABLE IF NOT EXISTS favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  recipe_name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, recipe_name)
);

-- Create index for faster user favorites lookups
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);

-- History (made recipes, ratings, notes)
CREATE TABLE IF NOT EXISTS recipe_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  recipe_name TEXT NOT NULL,
  has_made BOOLEAN DEFAULT 0,
  rating INTEGER DEFAULT 0,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, recipe_name)
);

-- Create index for faster user history lookups
CREATE INDEX IF NOT EXISTS idx_history_user_id ON recipe_history(user_id);
