/**
 * Database Query Functions
 * CRUD operations for all tables
 */

const bcrypt = require('bcrypt');
const { dbAll, dbGet, dbRun } = require('./db.cjs');

const SALT_ROUNDS = 10;

// ============= USER QUERIES =============

/**
 * Create a new user
 */
async function createUser(email, password, name = null) {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const sql = 'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)';
  const result = await dbRun(sql, [email, passwordHash, name]);
  return result.lastID;
}

/**
 * Find user by email
 */
async function findUserByEmail(email) {
  const sql = 'SELECT * FROM users WHERE email = ?';
  return await dbGet(sql, [email]);
}

/**
 * Find user by ID
 */
async function findUserById(id) {
  const sql = 'SELECT id, email, name, created_at FROM users WHERE id = ?';
  return await dbGet(sql, [id]);
}

/**
 * Verify user password
 */
async function verifyPassword(email, password) {
  const user = await findUserByEmail(email);
  if (!user) {
    return null;
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    return null;
  }

  // Return user without password hash
  const { password_hash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Update user profile
 */
async function updateUser(userId, updates) {
  const { name, email } = updates;
  const sql = 'UPDATE users SET name = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
  await dbRun(sql, [name, email, userId]);
  return await findUserById(userId);
}

// ============= INVENTORY QUERIES =============

/**
 * Get all inventory items for a user
 */
async function getUserInventory(userId) {
  const sql = 'SELECT * FROM inventory WHERE user_id = ? ORDER BY name';
  return await dbAll(sql, [userId]);
}

/**
 * Add inventory item
 */
async function addInventoryItem(userId, item) {
  const sql = `
    INSERT INTO inventory (
      user_id, liquor_type, name, stock_number, detailed_classification,
      distillation_method, abv, distillery_location, age_statement,
      additional_notes, profile_nose, palate, finish
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    userId,
    item.liquor_type || item['Liquor Type'] || '',
    item.name || item.Name,
    item.stock_number || item['Stock Number'] || 1,
    item.detailed_classification || item['Detailed Spirit Classification'] || '',
    item.distillation_method || item['Distillation Method'] || '',
    item.abv || item['ABV (%)'] || '',
    item.distillery_location || item['Distillery Location'] || '',
    item.age_statement || item['Age Statement or Barrel Finish'] || '',
    item.additional_notes || item['Additional Notes'] || '',
    item.profile_nose || item['Profile (Nose)'] || '',
    item.palate || item.Palate || '',
    item.finish || item.Finish || '',
  ];
  const result = await dbRun(sql, params);
  return result.lastID;
}

/**
 * Update inventory item
 */
async function updateInventoryItem(userId, itemId, item) {
  const sql = `
    UPDATE inventory SET
      liquor_type = ?, name = ?, stock_number = ?, detailed_classification = ?,
      distillation_method = ?, abv = ?, distillery_location = ?, age_statement = ?,
      additional_notes = ?, profile_nose = ?, palate = ?, finish = ?
    WHERE id = ? AND user_id = ?
  `;
  const params = [
    item.liquor_type || '',
    item.name,
    item.stock_number || 1,
    item.detailed_classification || '',
    item.distillation_method || '',
    item.abv || '',
    item.distillery_location || '',
    item.age_statement || '',
    item.additional_notes || '',
    item.profile_nose || '',
    item.palate || '',
    item.finish || '',
    itemId,
    userId,
  ];
  await dbRun(sql, params);
}

/**
 * Delete inventory item
 */
async function deleteInventoryItem(userId, itemId) {
  const sql = 'DELETE FROM inventory WHERE id = ? AND user_id = ?';
  await dbRun(sql, [itemId, userId]);
}

/**
 * Delete all inventory for user
 */
async function deleteAllUserInventory(userId) {
  const sql = 'DELETE FROM inventory WHERE user_id = ?';
  await dbRun(sql, [userId]);
}

/**
 * Bulk insert inventory items
 * Validates all items before inserting to prevent partial failures
 */
async function bulkInsertInventory(userId, items) {
  // Validate all items first
  if (!Array.isArray(items)) {
    throw new Error('Items must be an array');
  }

  if (items.length === 0) {
    return [];
  }

  if (items.length > 1000) {
    throw new Error('Cannot insert more than 1000 items at once');
  }

  // Validate each item has required fields
  const validatedItems = items.filter((item) => {
    const name = item.name || item.Name;
    return name && typeof name === 'string' && name.trim().length > 0;
  });

  if (validatedItems.length === 0) {
    throw new Error('No valid items to insert');
  }

  // Insert items (in future, use transactions for atomicity)
  const insertedIds = [];
  for (const item of validatedItems) {
    try {
      const id = await addInventoryItem(userId, item);
      insertedIds.push(id);
    } catch (error) {
      console.error(`Failed to insert item ${item.name || item.Name}:`, error);
      // Continue with other items
    }
  }
  return insertedIds;
}

// ============= RECIPE QUERIES =============

/**
 * Get all recipes for a user
 */
async function getUserRecipes(userId) {
  const sql = 'SELECT * FROM recipes WHERE user_id = ? ORDER BY name';
  return await dbAll(sql, [userId]);
}

/**
 * Add recipe
 */
async function addRecipe(userId, recipe) {
  const sql = `
    INSERT INTO recipes (user_id, name, ingredients, instructions, glass)
    VALUES (?, ?, ?, ?, ?)
  `;
  const params = [
    userId,
    recipe.name || recipe.Name,
    recipe.ingredients || recipe.Ingredients,
    recipe.instructions || recipe.Instructions || '',
    recipe.glass || recipe.Glass || '',
  ];
  const result = await dbRun(sql, params);
  return result.lastID;
}

/**
 * Update recipe
 */
async function updateRecipe(userId, recipeId, recipe) {
  const sql = `
    UPDATE recipes SET name = ?, ingredients = ?, instructions = ?, glass = ?
    WHERE id = ? AND user_id = ?
  `;
  const params = [recipe.name, recipe.ingredients, recipe.instructions, recipe.glass, recipeId, userId];
  await dbRun(sql, params);
}

/**
 * Delete recipe
 */
async function deleteRecipe(userId, recipeId) {
  const sql = 'DELETE FROM recipes WHERE id = ? AND user_id = ?';
  await dbRun(sql, [recipeId, userId]);
}

/**
 * Delete all recipes for user
 */
async function deleteAllUserRecipes(userId) {
  const sql = 'DELETE FROM recipes WHERE user_id = ?';
  await dbRun(sql, [userId]);
}

/**
 * Bulk insert recipes
 */
/**
 * Convert CSV recipe format to database format
 * Collects "Ingredient 1", "Ingredient 2", etc. into a JSON array
 */
function convertRecipeFormat(recipe) {
  // If already has ingredients field, return as-is
  if (recipe.ingredients || recipe.Ingredients) {
    const ingredients = recipe.ingredients || recipe.Ingredients;
    // If it's already a string (newline-separated), convert to array
    if (typeof ingredients === 'string') {
      const ingredientsArray = ingredients.split('\n').filter(i => i.trim());
      return {
        name: recipe.name || recipe['Drink Name'] || '',
        ingredients: JSON.stringify(ingredientsArray),
        instructions: recipe.instructions || recipe.Instructions || '',
        glass: recipe.glass || recipe.Glass || '',
      };
    }
    // If it's already an array
    if (Array.isArray(ingredients)) {
      return {
        name: recipe.name || recipe['Drink Name'] || '',
        ingredients: JSON.stringify(ingredients),
        instructions: recipe.instructions || recipe.Instructions || '',
        glass: recipe.glass || recipe.Glass || '',
      };
    }
  }

  // Convert from CSV format (Ingredient 1, Ingredient 2, etc.)
  const ingredients = [];
  const MAX_INGREDIENTS = 50; // Prevent DoS attacks with excessive ingredients
  let i = 1;
  while (i <= MAX_INGREDIENTS && recipe[`Ingredient ${i}`]) {
    const ing = recipe[`Ingredient ${i}`].trim();
    if (ing) {
      ingredients.push(ing);
    }
    i++;
  }

  return {
    name: recipe['Drink Name'] || recipe.name || '',
    ingredients: JSON.stringify(ingredients),
    instructions: recipe.Instructions || recipe.instructions || '',
    glass: recipe.Glass || recipe.glass || '',
  };
}

/**
 * Bulk insert recipes (converts CSV format to database format)
 * Validates all recipes before inserting
 */
async function bulkInsertRecipes(userId, recipes) {
  // Validate input
  if (!Array.isArray(recipes)) {
    throw new Error('Recipes must be an array');
  }

  if (recipes.length === 0) {
    return [];
  }

  if (recipes.length > 1000) {
    throw new Error('Cannot insert more than 1000 recipes at once');
  }

  // Convert and validate each recipe
  const validatedRecipes = [];
  for (const recipe of recipes) {
    try {
      const converted = convertRecipeFormat(recipe);
      // Validate has required fields
      if (converted.name && converted.name.trim().length > 0) {
        validatedRecipes.push(converted);
      }
    } catch (error) {
      console.error(`Failed to convert recipe:`, error);
      // Skip invalid recipes
    }
  }

  if (validatedRecipes.length === 0) {
    throw new Error('No valid recipes to insert');
  }

  // Insert recipes
  const insertedIds = [];
  for (const recipe of validatedRecipes) {
    try {
      const id = await addRecipe(userId, recipe);
      insertedIds.push(id);
    } catch (error) {
      console.error(`Failed to insert recipe ${recipe.name}:`, error);
      // Continue with other recipes
    }
  }
  return insertedIds;
}

// ============= FAVORITES QUERIES =============

/**
 * Get user favorites
 */
async function getUserFavorites(userId) {
  const sql = 'SELECT * FROM favorites WHERE user_id = ? ORDER BY created_at DESC';
  return await dbAll(sql, [userId]);
}

/**
 * Add favorite
 */
async function addFavorite(userId, recipeName) {
  const sql = 'INSERT OR IGNORE INTO favorites (user_id, recipe_name) VALUES (?, ?)';
  await dbRun(sql, [userId, recipeName]);
}

/**
 * Remove favorite
 */
async function removeFavorite(userId, recipeName) {
  const sql = 'DELETE FROM favorites WHERE user_id = ? AND recipe_name = ?';
  await dbRun(sql, [userId, recipeName]);
}

// ============= HISTORY QUERIES =============

/**
 * Get user recipe history
 */
async function getUserHistory(userId) {
  const sql = 'SELECT * FROM recipe_history WHERE user_id = ? ORDER BY updated_at DESC';
  return await dbAll(sql, [userId]);
}

/**
 * Get history for specific recipe
 */
async function getRecipeHistory(userId, recipeName) {
  const sql = 'SELECT * FROM recipe_history WHERE user_id = ? AND recipe_name = ?';
  return await dbGet(sql, [userId, recipeName]);
}

/**
 * Update or create recipe history
 */
async function upsertRecipeHistory(userId, recipeName, data) {
  const existing = await getRecipeHistory(userId, recipeName);

  if (existing) {
    const sql = `
      UPDATE recipe_history
      SET has_made = ?, rating = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND recipe_name = ?
    `;
    await dbRun(sql, [
      data.has_made !== undefined ? data.has_made : existing.has_made,
      data.rating !== undefined ? data.rating : existing.rating,
      data.notes !== undefined ? data.notes : existing.notes,
      userId,
      recipeName,
    ]);
  } else {
    const sql = `
      INSERT INTO recipe_history (user_id, recipe_name, has_made, rating, notes)
      VALUES (?, ?, ?, ?, ?)
    `;
    await dbRun(sql, [userId, recipeName, data.has_made || 0, data.rating || 0, data.notes || '']);
  }
}

module.exports = {
  // User queries
  createUser,
  findUserByEmail,
  findUserById,
  verifyPassword,
  updateUser,
  // Inventory queries
  getUserInventory,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  deleteAllUserInventory,
  bulkInsertInventory,
  // Recipe queries
  getUserRecipes,
  addRecipe,
  updateRecipe,
  deleteRecipe,
  deleteAllUserRecipes,
  bulkInsertRecipes,
  // Favorites queries
  getUserFavorites,
  addFavorite,
  removeFavorite,
  // History queries
  getUserHistory,
  getRecipeHistory,
  upsertRecipeHistory,
};
