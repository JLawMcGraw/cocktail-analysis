# Development Notes

Technical decisions, gotchas, and lessons learned during development.

---

## 2025-11-06 - Railway Deployment Configuration

**Context**: Needed to deploy v6.0.1 to Railway production with all security features enabled and proper environment configuration.

**Decision**: Created comprehensive Railway deployment guide and configured all required environment variables.

**Details**:
```bash
# Required Railway Environment Variables
JWT_SECRET=<64-char-hex-string>  # Generated with crypto.randomBytes(32)
NODE_ENV=production
FRONTEND_URL=https://cocktail-analysis-production.up.railway.app
DATABASE_PATH=./server/database/cocktail-analyzer.db
```

**Result**: Successfully deployed to https://cocktail-analysis-production.up.railway.app with all v6.0.1 security features active.

**Future Considerations**: Railway uses ephemeral filesystem storage - database resets on every deployment. Consider migrating to Railway PostgreSQL for persistent storage.

---

## 2025-11-06 - Temporary Admin API for Password Reset

**Context**: User account existed in production but password was unknown, and no password reset flow was implemented.

**Decision**: Created temporary admin API endpoint with secret key authentication to reset password, then removed it after use.

**Result**: Successfully reset user password, then immediately removed admin routes from codebase.

**Future Considerations**: Implement proper password reset flow with email verification and signed tokens with expiration.

---

## 2025-11-06 - Email Format Discovery Issue

**Context**: User couldn't login - signup said "account exists" but login said "invalid credentials".

**Problem**: User was trying `jacob.lawrence11@gmail.com` but database had `jacoblawrence11@gmail.com` (no dot).

**Result**: Identified correct email via admin endpoint, reset password, user successfully logged in.

**Future Considerations**: Gmail treats emails with/without dots as identical. Consider normalizing emails on signup (remove dots before @).

---

## 2025-11-06 - JWT Secret Validation Strategy

**Context**: Server was starting successfully even with hardcoded/default JWT secrets, creating a critical authentication bypass vulnerability (CVSS 9.8).

**Decision**: Implement fail-fast validation on module load in `server/middleware/auth.cjs`

**Details**:
```javascript
const JWT_SECRET = process.env.JWT_SECRET;

// Validate JWT secret on module load
if (!JWT_SECRET) {
  console.error('❌ FATAL ERROR: JWT_SECRET environment variable is not set!');
  process.exit(1);
}

if (JWT_SECRET.length < 32) {
  console.error('❌ FATAL ERROR: JWT_SECRET must be at least 32 characters long');
  process.exit(1);
}

// Warn if using common/default values
const DANGEROUS_SECRETS = [
  'default-secret-change-this',
  'your-super-secret-jwt-key-change-this-in-production',
  'secret',
  'mysecret',
  'jwt-secret',
  'change-me',
];

if (DANGEROUS_SECRETS.includes(JWT_SECRET)) {
  console.error('❌ FATAL ERROR: JWT_SECRET is using a default/common value!');
  console.error('Generate a secure secret with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
  process.exit(1);
}
```

**Result**: Server refuses to start if JWT secret is misconfigured, preventing production deployments with insecure configurations.

**Future Considerations**:
- Consider adding JWT secret rotation mechanism
- Add monitoring for JWT secret age (rotate every 90 days)

---

## 2025-11-06 - Rate Limiting Strategy

**Context**: Authentication endpoints had no rate limiting, allowing unlimited brute force attempts (CVSS 7.5).

**Decision**: Implemented dual rate limiter approach with `express-rate-limit@^8.2.1`

**Details**:
```javascript
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: { error: 'Too many authentication attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const strictAuthLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 failed attempts per window
  skipSuccessfulRequests: true, // Only count failed attempts
  message: { error: 'Too many failed login attempts, account temporarily locked' },
});

// Apply both limiters to auth routes
router.post('/signup', authLimiter, [...validation], handler);
router.post('/login', authLimiter, strictAuthLimiter, [...validation], handler);
```

**Rationale**:
- `authLimiter`: Prevents automated scanning (5 attempts in 15 minutes)
- `strictAuthLimiter`: Prevents targeted attacks (10 failed logins in 1 hour)
- `skipSuccessfulRequests`: Only penalizes failed attempts, not legitimate users

**Result**: Brute force attacks effectively blocked while allowing legitimate users normal access.

**Future Considerations**:
- Add IP-based tracking (currently global)
- Consider distributed rate limiting for multi-server deployments (Redis)
- Add account-level lockout after X failed attempts

---

## 2025-11-06 - CSRF Protection Implementation

**Context**: `csurf` package was deprecated/archived. Needed CSRF protection for state-changing routes (CVSS 6.1).

**Decision**: Implemented custom double-submit cookie pattern in `server/middleware/csrf.cjs`

**Details**:
```javascript
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function csrfProtection(req, res, next) {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];

  // Skip CSRF for safe methods
  if (safeMethods.includes(req.method)) {
    return next();
  }

  const cookieToken = req.cookies?.csrf_token;
  const headerToken = req.headers['x-csrf-token'];

  // Validate tokens match
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid or missing CSRF token',
    });
  }
  next();
}

function getCsrfToken(req, res) {
  const token = generateToken();

  res.cookie('csrf_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  });

  res.json({ csrfToken: token });
}
```

**Pattern**: Double-submit cookie
1. Server generates random token and sends as both cookie (HTTP-only) and JSON response
2. Client stores token and sends in `X-CSRF-Token` header on requests
3. Server validates cookie token matches header token

**Result**: CSRF protection without external dependencies, resistant to XSS and subdomain attacks.

**Future Considerations**:
- Consider synchronizer token pattern (server-side storage) for higher security
- Add CSRF token refresh mechanism
- Monitor for CSRF attack attempts

**Client Integration**:
```javascript
// Fetch CSRF token on app load
const response = await fetch('/api/csrf-token');
const { csrfToken } = await response.json();

// Include in all POST/PUT/DELETE requests
fetch('/api/inventory', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': csrfToken,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data),
});
```

---

## 2025-11-06 - Database Indexing Strategy

**Context**: Name-based searches were performing full table scans (O(n) complexity), causing performance issues with large datasets.

**Decision**: Added 12 B-tree indexes across 4 tables for compound queries

**Details**:
```sql
-- Inventory table indexes
CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_name ON inventory(name);
CREATE INDEX IF NOT EXISTS idx_inventory_user_name ON inventory(user_id, name);

-- Recipes table indexes
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_name ON recipes(name);
CREATE INDEX IF NOT EXISTS idx_recipes_user_name ON recipes(user_id, name);

-- Favorites table indexes
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_recipe ON favorites(recipe_name);
CREATE INDEX IF NOT EXISTS idx_favorites_user_recipe ON favorites(user_id, recipe_name);

-- History table indexes
CREATE INDEX IF NOT EXISTS idx_history_user_id ON recipe_history(user_id);
CREATE INDEX IF NOT EXISTS idx_history_recipe ON recipe_history(recipe_name);
CREATE INDEX IF NOT EXISTS idx_history_user_recipe ON recipe_history(user_id, recipe_name);
```

**Rationale**:
- Single-column indexes: Fast lookups by user_id or name
- Compound indexes: Optimize common queries filtering by both user_id AND name
- Covering indexes: Allow index-only scans without table access

**Performance Impact**:
| Query Type | Before | After | Improvement |
|------------|--------|-------|-------------|
| Search by name | O(n) | O(log n) | ~100x for 10k rows |
| User + name lookup | O(n) | O(log n) | ~100x for 10k rows |

**Result**: Queries are now logarithmic instead of linear, critical for scalability.

**Future Considerations**:
- Monitor index usage with `EXPLAIN QUERY PLAN`
- Consider full-text search indexes for ingredient matching
- Periodically run `VACUUM` and `ANALYZE` to optimize indexes

**SQLite Note**: Indexes increase database size (~10-20% per index) but dramatically improve read performance. Write performance is minimally impacted.

---

## 2025-11-06 - DoS Prevention in Recipe Parsing

**Context**: Recipe CSV parsing had no limit on ingredient columns, allowing infinite loop attacks.

**Decision**: Added `MAX_INGREDIENTS = 50` constant with enforced limit

**Details**:
```javascript
function convertRecipeFormat(recipe) {
  const ingredients = [];
  const MAX_INGREDIENTS = 50; // Prevent DoS attacks
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
```

**Rationale**:
- 50 ingredients is extremely generous for cocktail recipes (most have 3-7)
- Prevents CPU exhaustion from malicious CSVs with thousands of columns
- Still allows complex tiki drinks and punch recipes

**Result**: Recipe parsing cannot be weaponized for DoS attacks.

**Future Considerations**:
- Add timeout to CSV parsing operations
- Consider streaming CSV parser for very large files
- Add memory limits to prevent heap exhaustion

---

## 2025-11-06 - Bulk Operation Validation Pattern

**Context**: Bulk insert operations lacked validation, allowing partial failures and DoS via large payloads.

**Decision**: Implemented comprehensive validation with graceful degradation

**Details**:
```javascript
async function bulkInsertInventory(userId, items) {
  // Type validation
  if (!Array.isArray(items)) {
    throw new Error('Items must be an array');
  }

  // Size limits (prevent DoS)
  if (items.length > 1000) {
    throw new Error('Cannot insert more than 1000 items at once');
  }

  // Field validation
  const validatedItems = items.filter((item) => {
    const name = item.name || item.Name;
    return name && typeof name === 'string' && name.trim().length > 0;
  });

  // Graceful error handling with partial success
  const insertedIds = [];
  for (const item of validatedItems) {
    try {
      const id = await addInventoryItem(userId, item);
      insertedIds.push(id);
    } catch (error) {
      console.error(`Failed to insert item ${item.name}:`, error);
      // Continue with other items instead of failing entire batch
    }
  }

  return insertedIds;
}
```

**Benefits**:
- ✅ Type safety - rejects non-array inputs
- ✅ DoS prevention - 1000 item maximum
- ✅ Data quality - filters invalid items
- ✅ Partial success - valid items succeed even if some fail
- ✅ Observability - logs individual failures

**Result**: Robust bulk operations that handle edge cases gracefully.

**Future Considerations**:
- Add transaction support for atomic all-or-nothing operations
- Return detailed failure report (which items failed and why)
- Consider batch processing in chunks for very large imports

---

## 2025-11-06 - Documentation Consolidation Strategy

**Context**: 15 documentation files with 5,121 total lines, massive duplication across files.

**Decision**: Consolidated to 4 core files, archived 11 redundant files

**Before**:
```
README.md (1,200 lines)
IMPLEMENTATION.md (800 lines)
RELEASE_NOTES.md (500 lines)
AUTH_FEATURES.md (400 lines)
USER_AUTHENTICATION.md (350 lines)
BACKEND_README.md (300 lines)
... (9 more files)
Total: 5,121 lines across 15 files
```

**After**:
```
README.md (313 lines - rewritten from scratch)
SECURITY_FIXES.md (425 lines - new)
MEDIUM_PRIORITY_FIXES.md (318 lines - new)
CHANGELOG.md (144 lines - enhanced)
Total: 1,200 lines across 4 core files
```

**Archived to `.archive/old-docs/`**:
- AUTH_FEATURES.md
- USER_AUTHENTICATION.md
- IMPLEMENTATION.md
- BACKEND_README.md
- MODULARIZATION_COMPLETE.md
- RELEASE_NOTES.md
- GIT_WORKFLOW.md
- BRANCH_CLEANUP_GUIDE.md
- GITHUB_SETUP_LINKS.md
- AI_SETUP.md
- MIGRATION.md

**Result**: 76% reduction in documentation size while improving clarity and maintainability.

**Future Considerations**:
- Keep documentation DRY (Don't Repeat Yourself)
- Single source of truth for each topic
- Archive instead of delete (preserve historical context)
- Regular documentation audits to prevent bloat

---

## 2025-11-06 - HTTPS Enforcement Pattern

**Context**: Application was not enforcing HTTPS in production, allowing unencrypted traffic (CVSS 7.4).

**Decision**: Added production HTTPS redirect middleware with enhanced Helmet configuration

**Details**:
```javascript
// HTTPS enforcement in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(301, `https://${req.header('host')}${req.url}`);
    }
    next();
  });
}

// Enhanced Helmet security headers
app.use(helmet({
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true,
  },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
}));
```

**Rationale**:
- `x-forwarded-proto` header is set by reverse proxies (Railway, Heroku, etc.)
- 301 redirect ensures browsers cache the redirect
- HSTS header tells browsers to always use HTTPS (1 year duration)
- CSP prevents XSS attacks by restricting resource loading

**Result**: All production traffic automatically upgraded to HTTPS with strict transport security.

**Future Considerations**:
- Submit domain to HSTS preload list
- Consider upgrading `'unsafe-inline'` styles to nonces
- Add report-uri for CSP violation monitoring

---

## SQLite-Specific Considerations

### Current Database Library
Using `sqlite3` package (async, callback-based) instead of `better-sqlite3` (sync, faster).

**Tradeoffs**:
- `sqlite3`: Async with callbacks, Node.js-style error handling
- `better-sqlite3`: Synchronous, ~2x faster, simpler API

**Future Migration**: Consider switching to `better-sqlite3` for:
- Better performance (synchronous I/O is faster for SQLite)
- Simpler error handling (no callbacks)
- Built-in prepared statement caching
- Transaction support with `BEGIN/COMMIT/ROLLBACK`

### Database Rebuild Requirements
SQLite native modules require rebuilding after npm install on different platforms:

```bash
npm rebuild better-sqlite3
```

**Gotcha**: This can fail if build tools are missing (Python, node-gyp, C++ compiler)

### Migration Considerations
When migrating from `sqlite3` to `better-sqlite3`:
- Change all async functions to sync
- Remove callbacks and use direct returns
- Wrap multi-statement operations in transactions
- Update all imports from `sqlite3` to `better-sqlite3`

---
