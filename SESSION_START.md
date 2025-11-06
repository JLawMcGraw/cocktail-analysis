# Cocktail Analyzer Project - Session Initialization

## FOR CLAUDE: READ THESE FILES IMMEDIATELY

Hello Claude, we're continuing work on **Cocktail Analyzer** - a sophisticated bar inventory management and cocktail recommendation platform. This prompt is designed to efficiently initialize the proper context. As soon as you receive this prompt, please read the following files in order:

1. **THIS ENTIRE PROMPT DOCUMENT FIRST**
2. `/home/user/cocktail-analysis/Documentation/README.md`
3. `/home/user/cocktail-analysis/Documentation/IMPLEMENTATION.md`
4. `/home/user/cocktail-analysis/Documentation/RELEASE_NOTES.md`

---

## Project Overview

**Cocktail Analyzer** is a full-stack web application that helps users manage their bar inventory, discover cocktails they can make with available ingredients, and get AI-powered bartending recommendations.

### Current Status
- **Phase**: Production Ready (v6.0.0 - November 2025)
- **Branch**: `main` (modular architecture complete)
- **Status**: Full authentication system, database persistence, and AI integration

### Tech Stack
- **Frontend**: Vanilla JavaScript (ES Modules) + Vite 5.0.8 + Modern CSS
- **Backend**: Node.js 18+ + Express.js 4.18.2
- **Database**: SQLite (better-sqlite3)
- **Authentication**: JWT + bcrypt
- **AI Integration**: Anthropic Claude API (optional user-provided key)
- **Data Format**: CSV import for inventory and recipes

### Key Directories
- `/home/user/cocktail-analysis/src/` - Frontend application (1,736+ lines)
- `/home/user/cocktail-analysis/src/services/` - Modular business logic (auth, API, AI, storage)
- `/home/user/cocktail-analysis/src/utils/` - Helper utilities (formatters, fuzzy matching)
- `/home/user/cocktail-analysis/server/` - Backend API and database (~750 lines)
- `/home/user/cocktail-analysis/Documentation/` - Comprehensive documentation (11 files)

---

## Documentation Structure

Documentation is organized in a tiered system for efficient context loading:

### Tier 1: Essential Context (LOAD FIRST)

- `/home/user/cocktail-analysis/Documentation/README.md` - Main project overview (11K)
- `/home/user/cocktail-analysis/Documentation/IMPLEMENTATION.md` - Complete implementation guide (24K)
- `/home/user/cocktail-analysis/Documentation/RELEASE_NOTES.md` - v6.0.0 features and changes (11K)

### Tier 2: Architecture & Features (LOAD WHEN NEEDED)

- `/home/user/cocktail-analysis/Documentation/MODULARIZATION_COMPLETE.md` - Modular architecture details (11K)
- `/home/user/cocktail-analysis/Documentation/AUTH_FEATURES.md` - Authentication system deep dive (5.9K)
- `/home/user/cocktail-analysis/Documentation/USER_AUTHENTICATION.md` - Auth system overview (5.2K)

### Tier 3: Version Control & Migration (LOAD ON DEMAND)

- `/home/user/cocktail-analysis/Documentation/GIT_WORKFLOW.md` - Git workflow and branching strategy (7.2K)
- `/home/user/cocktail-analysis/Documentation/BRANCH_CLEANUP_GUIDE.md` - Branch management procedures (5.8K)
- `/home/user/cocktail-analysis/Documentation/MIGRATION.md` - v5→v6 migration guide (6.5K)
- `/home/user/cocktail-analysis/Documentation/CHANGELOG.md` - Complete version history (19K)

### Tier 4: Configuration & Setup (LOAD ON DEMAND)

- `/home/user/cocktail-analysis/Documentation/GITHUB_SETUP_LINKS.md` - GitHub configuration references (1.7K)
- `/home/user/cocktail-analysis/.env.example` - Environment variable template
- `/home/user/cocktail-analysis/vite.config.js` - Vite build configuration
- `/home/user/cocktail-analysis/.eslintrc.json` - Code quality rules
- `/home/user/cocktail-analysis/.prettierrc.json` - Code formatting rules

---

## START HERE

1. **IMMEDIATELY READ** the essential files:
   - `/home/user/cocktail-analysis/Documentation/README.md`
   - `/home/user/cocktail-analysis/Documentation/IMPLEMENTATION.md`
   - `/home/user/cocktail-analysis/Documentation/RELEASE_NOTES.md`

2. **BASED ON THE TASK**, selectively load:
   - Architecture details: `MODULARIZATION_COMPLETE.md`
   - Auth system: `AUTH_FEATURES.md` or `USER_AUTHENTICATION.md`
   - Git workflow: `GIT_WORKFLOW.md` or `BRANCH_CLEANUP_GUIDE.md`

3. **ONLY IF NEEDED**, reference:
   - Migration guides
   - Complete changelog
   - Configuration files
   - GitHub setup documentation

---

## Important Development Guidelines

### Git Workflow

**Current Branch**: `claude/add-session-start-md-011CUqiMmd5ZUTBnSo6YkXze`

- **ALWAYS** develop on the designated branch for your session
- Branch naming for Claude sessions: Must start with `claude/` and end with matching session ID
- Use descriptive commit messages following conventional commits format
- Push with: `git push -u origin <branch-name>`
- For work on main: Ensure you have explicit permission before pushing

### Database Operations

```bash
# Database is auto-created on first run
# Located at: ./cocktail.db (or path specified in DB_PATH env var)

# CRITICAL: After npm install, always rebuild SQLite bindings
npm rebuild better-sqlite3

# Database structure (5 tables):
# - users (authentication)
# - inventory (bar stock)
# - recipes (cocktail recipes)
# - favorites (saved favorites)
# - history (user activity)
```

### Development Server

```bash
# Start both frontend and backend concurrently
npm run dev:all

# OR start separately:

# Backend only (Express on port 3000)
npm run server

# Frontend only (Vite on port 5173)
npm run dev

# Build for production
npm run build
```

### Environment Setup

Required `.env` variables:

```env
# Server Configuration
PORT=3000

# JWT Secret (MUST CHANGE IN PRODUCTION)
JWT_SECRET=your-secret-key-change-this-in-production

# Database Path
DB_PATH=./cocktail.db

# Anthropic API (optional - users can provide their own)
ANTHROPIC_API_KEY=
```

**⚠️ CRITICAL:** Always run `npm rebuild better-sqlite3` after `npm install`

---

## Critical Rules & Best Practices

### Code Quality

- ✅ Modern JavaScript (ES2021) with ES Modules in frontend
- ✅ CommonJS modules in backend (server.cjs, database.cjs, etc.)
- ✅ Use Vite path aliases: `@`, `@components`, `@services`, `@utils`, `@styles`
- ✅ Include error handling in all async operations
- ✅ Add loading states for user-facing operations
- ✅ Follow ESLint and Prettier configurations
- ⚠️ Never store passwords in plaintext (always use bcrypt)
- ⚠️ Never expose JWT secrets or API keys in frontend code

### Security Requirements

- **XSS Protection**: Use `formatters.js` for HTML escaping
- **SQL Injection**: Use prepared statements (already implemented)
- **Password Policy**: Minimum 6 characters, bcrypt hashed (10 rounds)
- **JWT Expiration**: 7 days
- **Data Isolation**: All queries filtered by `user_id`

### Testing Requirements

Before deploying changes:

- Test locally with `npm run dev:all`
- Verify both frontend (5173) and backend (3000) ports are available
- Test authentication flow (signup, login, logout)
- Check CSV import for inventory and recipes
- Verify data persistence across browser refresh
- Test AI bartender integration (if API key configured)

### Git Operations

- NEVER use `--force` push to main/master
- NEVER skip hooks (`--no-verify`) unless explicitly requested
- NEVER update git config
- ALWAYS check authorship before amending commits
- Retry network failures up to 4 times with exponential backoff (2s, 4s, 8s, 16s)

---

## Common Pitfalls & Solutions

⚠️ Watch out for:

### SQLite Build Issues
**Problem**: `Error: Cannot find module 'better-sqlite3'`
**Solution**: Always run `npm rebuild better-sqlite3` after installation

### Port Conflicts
**Problem**: `Error: listen EADDRINUSE: address already in use :::3000`
**Solution**: Kill process on port 3000 or change PORT in .env

### JWT Secret Not Changed
**Problem**: Security vulnerability with default JWT secret
**Solution**: Generate random string and set in .env: `JWT_SECRET=<random-string>`

### CORS Issues
**Problem**: Frontend can't reach backend API
**Solution**: Ensure CORS is enabled in server.cjs (already configured for localhost)

### CSV Import Format Mismatch
**Problem**: CSV import fails or shows incorrect data
**Solution**:
- Inventory: 12 columns (Name, Stock Number, Liquor Type, etc.)
- Recipes: 4 columns (Drink Name, Ingredients, Instructions, Glass)

### Auto-sync Not Working
**Problem**: Changes not persisting across devices
**Solution**: Check JWT token in localStorage, verify backend API endpoints return 200

---

## Database Schema Overview

### Core Tables (5 tables)

#### `users`
- User authentication (email, password_hash)
- Created/updated timestamps

#### `inventory`
- User's bar stock (JSON serialized)
- Foreign key to users with CASCADE DELETE

#### `recipes`
- User's cocktail recipes (JSON serialized)
- Foreign key to users with CASCADE DELETE

#### `favorites`
- User's favorite cocktails (JSON serialized)
- Foreign key to users with CASCADE DELETE

#### `history`
- User activity log (JSON serialized)
- Foreign key to users with CASCADE DELETE

### Data Persistence Pattern
- Latest record per user: `ORDER BY updated_at DESC LIMIT 1`
- Upsert pattern: Check existing → Update or Insert
- Automatic CASCADE DELETE for user data cleanup
- All tables indexed on `user_id` for performance

---

## API Endpoints Reference

### Authentication (`/api/auth`)
```
POST   /api/auth/signup        - Create account
POST   /api/auth/login         - Authenticate user
GET    /api/auth/me            - Get current user (JWT required)
POST   /api/auth/logout        - Terminate session
```

### Inventory (`/api/inventory`)
```
GET    /api/inventory          - Retrieve bar stock (JWT required)
POST   /api/inventory          - Save bar stock (JWT required)
```

### Recipes (`/api/recipes`)
```
GET    /api/recipes            - Retrieve recipes (JWT required)
POST   /api/recipes            - Save recipes (JWT required)
```

### User Data (`/api/user-data`)
```
GET    /api/user-data/favorites      - Get favorites (JWT required)
POST   /api/user-data/favorites      - Save favorites (JWT required)
GET    /api/user-data/history        - Get history (JWT required)
POST   /api/user-data/history        - Save history (JWT required)
```

### AI Integration
```
POST   /api/messages           - Anthropic Claude proxy (open)
```

### Health Check
```
GET    /api/health             - Server status (open)
```

---

## Required Actions After Reading This Prompt

After reading this entire prompt and the required files, Claude should:

1. ✅ Confirm you've read the essential files (README, IMPLEMENTATION, RELEASE_NOTES)
2. 🎯 Summarize current project status and any outstanding concerns
3. ❓ Ask what specific task or feature we'll be working on
4. 📋 Load relevant additional documentation based on the task
5. ⏸️ Wait for task specification before proceeding with any changes

---

## Quick Reference Commands

### Installation & Setup
```bash
npm install                          # Install dependencies
npm rebuild better-sqlite3           # CRITICAL: Rebuild SQLite bindings
cp .env.example .env                 # Create environment config
# Edit .env and set JWT_SECRET
```

### Development
```bash
npm run dev:all          # Start both frontend & backend
npm run server           # Backend only (port 3000)
npm run dev              # Frontend only (port 5173)
npm run build            # Production build
npm run test             # Run tests with Vitest
npm run test:ui          # Vitest UI mode
npm run lint             # Check code quality
npm run lint:fix         # Auto-fix linting issues
npm run format           # Format code with Prettier
```

### Git Operations
```bash
git status                                      # Check status
git add .                                       # Stage changes
git commit -m "type: description"              # Commit (conventional)
git push -u origin <branch-name>               # Push to branch
```

### Troubleshooting
```bash
# SQLite build issues
npm rebuild better-sqlite3

# Port conflicts
lsof -ti:3000 | xargs kill -9     # macOS/Linux
netstat -ano | findstr :3000      # Windows

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm rebuild better-sqlite3

# Check backend is running
curl http://localhost:3000/api/health

# Check frontend can reach backend
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <your-jwt-token>"
```

---

## Project Statistics

| Metric | Value |
|--------|-------|
| **Version** | 6.0.0 |
| **Frontend Code** | ~2,000 lines (12 modules) |
| **Backend Code** | ~750 lines (server, database, routes) |
| **Documentation** | 100K+ total (11 comprehensive guides) |
| **Database Tables** | 5 (users + 4 user data tables) |
| **API Endpoints** | 13 total |
| **CSS Modules** | 7 separate files |
| **Node.js Requirement** | >= 18.0.0 |
| **License** | MIT |

---

## Key Features

### Core Functionality
- ✅ User authentication (JWT + bcrypt)
- ✅ Bar inventory management
- ✅ Cocktail recipe database
- ✅ Ingredient matching algorithm with fuzzy search
- ✅ CSV import/export for inventory and recipes
- ✅ AI bartending assistant (Anthropic Claude)
- ✅ Favorites and history tracking
- ✅ Auto-sync every 30 seconds
- ✅ Cross-device data synchronization

### Technical Features
- ✅ Modular frontend architecture
- ✅ RESTful API with Express
- ✅ SQLite persistence with better-sqlite3
- ✅ XSS protection with HTML escaping
- ✅ SQL injection prevention with prepared statements
- ✅ Responsive CSS Grid/Flexbox layout
- ✅ Vite dev server with HMR
- ✅ ESLint + Prettier code quality

---

## Development Workflow

### Starting a New Task

1. **Checkout the designated branch**
   ```bash
   git checkout claude/add-session-start-md-011CUqiMmd5ZUTBnSo6YkXze
   ```

2. **Ensure environment is ready**
   ```bash
   npm install
   npm rebuild better-sqlite3
   cp .env.example .env
   # Edit .env with proper JWT_SECRET
   ```

3. **Start development servers**
   ```bash
   npm run dev:all
   ```

4. **Make changes following project guidelines**
   - Use modular service architecture
   - Add error handling
   - Update documentation if needed
   - Follow ESLint/Prettier rules

5. **Test thoroughly**
   - Test authentication flow
   - Verify data persistence
   - Check CSV import/export
   - Test AI integration (if applicable)

6. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: description of changes"
   git push -u origin claude/add-session-start-md-011CUqiMmd5ZUTBnSo6YkXze
   ```

---

## Session Initialization Complete

✅ Ready to receive task specification.

**Next Steps:**
1. Confirm context loading complete
2. Identify the specific task or feature to work on
3. Load additional documentation as needed
4. Begin implementation following project guidelines
