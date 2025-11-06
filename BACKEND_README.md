# Cocktail Analyzer - Backend Authentication System

## Overview

The backend has been fully implemented with SQLite database, JWT authentication, and complete API endpoints for user data management.

## What's Been Implemented

### ✅ Database Layer (SQLite)
- **Location**: `server/database/`
- **Files**:
  - `schema.sql` - Database schema with all tables
  - `db.cjs` - Database connection and helper functions
  - `queries.cjs` - CRUD operations for all tables

**Tables Created:**
- `users` - User accounts (email, password hash, profile)
- `inventory` - User's bar stock (spirits, liquors, etc.)
- `recipes` - User's recipe collection
- `favorites` - User's favorite recipes
- `recipe_history` - Recipe ratings, notes, "made this" tracking

### ✅ Authentication System (JWT)
- **Location**: `server/middleware/auth.cjs`
- **Features**:
  - JWT token generation and verification
  - Password hashing with bcrypt (10 salt rounds)
  - Protected route middleware
  - Token expires in 7 days

### ✅ API Endpoints

#### Authentication Endpoints
```
POST   /auth/signup          - Create new account
POST   /auth/login           - Login and get JWT token
GET    /auth/me              - Get current user profile (protected)
POST   /auth/logout          - Logout (protected)
```

#### Inventory Endpoints (Protected)
```
GET    /api/inventory        - Get user's bar stock
POST   /api/inventory        - Add single item
POST   /api/inventory/bulk   - Bulk upload from CSV
PUT    /api/inventory/:id    - Update item
DELETE /api/inventory/:id    - Delete item
DELETE /api/inventory        - Clear all inventory
```

#### Recipe Endpoints (Protected)
```
GET    /api/recipes          - Get user's recipes
POST   /api/recipes          - Add single recipe
POST   /api/recipes/bulk     - Bulk upload from CSV
PUT    /api/recipes/:id      - Update recipe
DELETE /api/recipes/:id      - Delete recipe
DELETE /api/recipes          - Clear all recipes
```

#### Favorites & History Endpoints (Protected)
```
GET    /api/favorites        - Get user's favorites
POST   /api/favorites        - Add to favorites
DELETE /api/favorites/:name  - Remove from favorites
GET    /api/favorites/history - Get recipe history
POST   /api/favorites/history - Update history (rating, notes, made status)
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Inventory Table
```sql
CREATE TABLE inventory (
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
```

### Recipes Table
```sql
CREATE TABLE recipes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  ingredients TEXT NOT NULL,
  instructions TEXT,
  glass TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Favorites Table
```sql
CREATE TABLE favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  recipe_name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, recipe_name)
);
```

### Recipe History Table
```sql
CREATE TABLE recipe_history (
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
```

## Running the Backend

### Start the Server
```bash
npm run server
```

The server will start on `http://localhost:3000` and automatically:
1. Connect to SQLite database at `server/database/cocktail-analyzer.db`
2. Initialize database schema if needed
3. Display all available API endpoints

### Environment Variables
Create a `.env` file in the project root:
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
FRONTEND_URL=http://localhost:5173
DATABASE_PATH=./server/database/cocktail-analyzer.db
```

## Testing the API

### Using curl

**Create Account:**
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Get Inventory (with token):**
```bash
curl http://localhost:3000/api/inventory \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Add Inventory Item:**
```bash
curl -X POST http://localhost:3000/api/inventory \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"name":"Maker'\''s Mark","liquor_type":"Bourbon","stock_number":1}'
```

## File Structure

```
server/
├── database/
│   ├── schema.sql           # Database schema
│   ├── db.cjs              # Database connection & helpers
│   ├── queries.cjs         # CRUD operations
│   └── cocktail-analyzer.db # SQLite database file
├── middleware/
│   └── auth.cjs            # JWT authentication middleware
├── routes/
│   ├── auth.cjs            # Authentication routes
│   ├── inventory.cjs       # Inventory management routes
│   ├── recipes.cjs         # Recipe management routes
│   └── favorites.cjs       # Favorites & history routes
└── server.cjs              # Main server file
```

## Security Features

1. **Password Hashing**: bcrypt with 10 salt rounds
2. **JWT Tokens**: Secure token-based authentication
3. **Protected Routes**: Middleware validates tokens on all API endpoints
4. **Input Validation**: express-validator on all inputs
5. **Helmet**: Security headers middleware
6. **Foreign Key Constraints**: Automatic cleanup on user deletion

## Next Steps - Frontend Integration (Phase 2)

### To Do:
1. Create login/signup pages in frontend
2. Add JWT token storage and management
3. Update frontend to call API endpoints instead of localStorage
4. Add authentication state management
5. Implement protected routes in frontend
6. Add loading states and error handling
7. Test complete user flow

## Dependencies Added

```json
{
  "bcrypt": "^5.1.0",              // Password hashing
  "jsonwebtoken": "^9.0.0",        // JWT authentication
  "sqlite3": "^5.1.0",             // SQLite database
  "express-validator": "^7.0.0",   // Input validation
  "helmet": "^7.0.0",              // Security headers
  "multer": "^1.4.0"               // File uploads
}
```

## Database Location

The SQLite database file is created at:
```
server/database/cocktail-analyzer.db
```

This file will be created automatically when the server first starts.

## Common Issues & Solutions

### Issue: "ReferenceError: require is not defined"
**Solution**: All backend files use `.cjs` extension because package.json has `"type": "module"`

### Issue: "SQLITE_ERROR: table users already exists"
**Solution**: Database schema uses `CREATE TABLE IF NOT EXISTS`, so this shouldn't happen. If it does, delete the `.db` file and restart.

### Issue: "401 Unauthorized"
**Solution**: Make sure to include the JWT token in the Authorization header:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### Issue: Token expired
**Solution**: Tokens expire after 7 days. Login again to get a new token.

## Future Enhancements

- [ ] Refresh token mechanism
- [ ] Email verification
- [ ] Password reset functionality
- [ ] Rate limiting
- [ ] Session management
- [ ] Migrate to PostgreSQL for production
- [ ] Add Redis for session storage
- [ ] Implement OAuth (Google, GitHub)
- [ ] Add API documentation with Swagger
- [ ] Add comprehensive test suite

---

**Status**: ✅ Phase 1 Complete - Backend authentication system fully implemented and tested.
**Next**: Phase 2 - Frontend integration with login/signup pages and API calls.
