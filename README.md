# 🍹 Cocktail Analyzer

**Version 6.0.1** - A modern web app for managing your home bar, discovering cocktails, and getting AI-powered recommendations.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Security](https://img.shields.io/badge/security-hardened-green.svg)](./SECURITY_FIXES.md)

---

## ✨ Features

- 🔐 **Secure Authentication** - JWT-based user accounts with bcrypt encryption
- 📊 **Inventory Management** - Track your home bar with detailed tasting notes
- 🍸 **Smart Recipe Matching** - Fuzzy search finds cocktails you can make
- 🤖 **AI Bartender** - Claude-powered recommendations and substitutions
- ❤️ **Favorites & History** - Save and rate cocktails
- 🔄 **Auto-Sync** - Data synchronized across devices

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Rebuild SQLite bindings (IMPORTANT!)
npm rebuild sqlite3

# 3. Configure environment
cp .env.example .env

# 4. Generate secure JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy output and paste into .env as JWT_SECRET

# 5. (Optional) Add Anthropic API key for AI features
# Get key from: https://console.anthropic.com/
# Add to .env: ANTHROPIC_API_KEY=sk-ant-...
```

### Running the App

**Development (recommended):**
```bash
# Terminal 1 - Backend (port 3000)
npm run server

# Terminal 2 - Frontend (port 5173)
npm run dev
```

**Or run both together:**
```bash
npm run dev:all
```

Open http://localhost:5173 in your browser.

### First-Time Setup

1. Click "Sign Up" and create an account
2. Upload your bar stock CSV (see `sample-bar-stock.csv`)
3. Upload recipe CSVs (see `sample-recipes.csv`)
4. Click "Analyze My Bar" to see what you can make!

---

## 📁 Project Structure

```
cocktail-analysis/
├── server/                  # Backend (Node.js + Express)
│   ├── server.cjs          # Main server
│   ├── database/           # SQLite database
│   ├── middleware/         # Auth, CSRF protection
│   └── routes/             # API endpoints
├── src/                    # Frontend (ES Modules)
│   ├── services/           # API, Auth, AI, Storage
│   ├── utils/              # Formatters, fuzzy matching
│   ├── features/           # UI components
│   └── styles/             # CSS modules
├── .env                    # Configuration (create from .env.example)
└── cocktail.db            # SQLite database (auto-created)
```

---

## 🔐 Security

**v6.0.1** includes comprehensive security hardening:
- ✅ JWT secret validation (fails fast if misconfigured)
- ✅ Rate limiting on auth endpoints (5 attempts per 15 min)
- ✅ CSRF protection on all state-changing routes
- ✅ HTTPS enforcement in production
- ✅ XSS protection with HTML escaping
- ✅ SQL injection prevention with prepared statements
- ✅ Secure password hashing (bcrypt, 10 rounds)

See [SECURITY_FIXES.md](./SECURITY_FIXES.md) for details.

---

## 📡 API Endpoints

### Authentication
```
POST   /auth/signup          Create account
POST   /auth/login           Login
GET    /auth/me              Get profile (protected)
POST   /auth/logout          Logout (protected)
```

### Data (All Protected)
```
GET    /api/inventory        Get bar stock
POST   /api/inventory        Add/update inventory
GET    /api/recipes          Get recipes
POST   /api/recipes          Add/update recipes
GET    /api/favorites        Get favorites
POST   /api/favorites        Add favorite
GET    /api/csrf-token       Get CSRF token (for API calls)
```

### AI
```
POST   /api/messages         Anthropic Claude proxy
```

---

## 🛠️ Development

### Build for Production
```bash
npm run build
```

### Code Quality
```bash
npm run lint          # Check code
npm run lint:fix      # Auto-fix issues
npm run format        # Format with Prettier
```

### Testing
```bash
npm test              # Run tests with Vitest
npm run test:ui       # Vitest UI mode
```

---

## 📝 Environment Variables

Required in `.env`:

```env
# Server
PORT=3000
NODE_ENV=development

# JWT Secret (REQUIRED - Generate with crypto.randomBytes(32))
JWT_SECRET=your-64-character-hex-string-here

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_PATH=./server/database/cocktail-analyzer.db

# Anthropic API (Optional - for AI features)
ANTHROPIC_API_KEY=sk-ant-api03-...
```

**⚠️ CRITICAL:** Generate a secure JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📊 CSV Format

### Bar Stock (`sample-bar-stock.csv`)
12 columns: Name, Stock Number, Liquor Type, Detailed Spirit Classification, Distillation Method, ABV (%), Distillery Location, Age Statement, Additional Notes, Profile (Nose), Palate, Finish

### Recipes (`sample-recipes.csv`)
4 columns: Drink Name, Ingredients, Instructions, Glass

---

## 🐛 Troubleshooting

### Server won't start
```bash
# Rebuild SQLite bindings
npm rebuild sqlite3

# Check .env file exists and has JWT_SECRET set
cat .env

# Generate secure JWT_SECRET if needed
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Port already in use
```bash
# Windows
netstat -ano | findstr :3000

# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Or change PORT in .env
```

### CSRF token errors
Make sure frontend includes CSRF token in requests:
```javascript
// Get token
const res = await fetch('/api/csrf-token', { credentials: 'include' });
const { csrfToken } = await res.json();

// Use in requests
fetch('/api/inventory', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': csrfToken,
    'Authorization': `Bearer ${authToken}`
  },
  credentials: 'include',
  body: JSON.stringify(data)
});
```

See `server/middleware/README_CSRF.md` for full CSRF implementation guide.

---

## 🎨 Tech Stack

**Frontend:**
- Vanilla JavaScript (ES Modules)
- Vite 5.0.8
- PapaParse (CSV)
- Modern CSS

**Backend:**
- Node.js + Express 4.18.2
- SQLite (sqlite3 - async callback-based)
- JWT + bcrypt
- Helmet (security headers)
- express-rate-limit
- Custom CSRF middleware

**External APIs:**
- Anthropic Claude API

---

## 📚 Documentation

- **[RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md)** - Complete Railway deployment guide
- **[SECURITY_FIXES.md](./SECURITY_FIXES.md)** - Security hardening details (v6.0.1)
- **[MEDIUM_PRIORITY_FIXES.md](./MEDIUM_PRIORITY_FIXES.md)** - Performance & validation improvements
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history
- **[server/middleware/README_CSRF.md](./server/middleware/README_CSRF.md)** - CSRF implementation guide
- **[Documentation/](./Documentation/)** - Session history, project status, active tasks, and dev notes

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

---

## 🙏 Acknowledgments

- **Anthropic** - Claude API for AI bartender
- **PapaParse** - CSV parsing library
- **sqlite3** - Database engine
- **Vite** - Modern build tool

---

## 💡 Quick Commands

```bash
# Install & Setup
npm install && npm rebuild sqlite3
cp .env.example .env
# Edit .env with JWT_SECRET (use: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Development
npm run dev:all          # Start everything

# Production
npm run build            # Build frontend
npm start                # Start server

# Maintenance
npm run lint:fix         # Fix code issues
npm run format           # Format code
```

---

## 🌐 Production Deployment

**Live App**: https://cocktail-analysis-production.up.railway.app

See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) for complete deployment instructions.

---

**Built with ❤️ using Claude Code**

Version 6.0.1 | Production Ready | [Report Issues](https://github.com/JLawMcGraw/cocktail-analysis/issues)
