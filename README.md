# 🍹 Cocktail Compatibility Analyzer

**Version 6.0.0 - Full-Stack Application with User Authentication**

A modern web application that helps you discover what cocktails you can make with your home bar, powered by AI and intelligent recipe matching.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Version](https://img.shields.io/badge/version-6.0.0-blue.svg)](https://github.com)

---

## ✨ Features

### 🔐 User Authentication (NEW in v6.0)
- **Secure Login**: JWT-based authentication with bcrypt password hashing
- **Persistent Data**: Your bar stock and recipes saved to the cloud
- **Multi-Device Sync**: Access your data from anywhere
- **Auto-Save**: Changes automatically sync every 30 seconds

### 🍸 Smart Recipe Matching
- **Intelligent Analysis**: Fuzzy matching with ingredient aliases
- **Compatibility Scoring**: Find perfect matches, near-matches, and possibilities
- **Shopping Lists**: See what you're missing for "almost there" cocktails
- **Real-Time Search**: Filter and search your cocktail collection

### 🤖 AI Bartender Assistant
- **Natural Language**: Ask Claude anything about cocktails
- **Contextual Help**: Get recommendations based on your inventory
- **Ingredient Substitutions**: Find alternatives when you're missing something
- **Cocktail History**: Learn about classic drinks and techniques

### 📊 Inventory Management
- **Detailed Tracking**: 12-column CSV format with tasting notes
- **Stock Levels**: Track what's in stock
- **Spirit Classifications**: Organize by type, region, and style
- **Export/Import**: Backup your data anytime

### ❤️ Favorites & History
- **Save Favorites**: Mark your go-to cocktails
- **Rate & Review**: 5-star ratings and tasting notes
- **Track Made Drinks**: Remember what you've tried
- **Recently Viewed**: Quick access to recent recipes

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd cocktail-analysis

# 2. Checkout the main branch
git checkout claude/implement-user-upload-011CUUSDX8XNRiZrkJWbSkVd

# 3. Install dependencies
npm install

# 4. Rebuild SQLite bindings
npm rebuild better-sqlite3

# 5. Configure environment
cp .env.example .env
# Edit .env and set JWT_SECRET to a random string
```

### Running the App

**Option 1: Run both frontend and backend together**
```bash
npm run dev:all
```

**Option 2: Run separately (recommended for development)**

Terminal 1 - Backend Server:
```bash
npm run server
# Runs on http://localhost:3000
```

Terminal 2 - Frontend:
```bash
npm run dev
# Runs on http://localhost:5173 (Vite dev server)
```

### First Time Setup

1. **Open** `http://localhost:5173` in your browser
2. **Sign Up** - Click "Sign Up" and create an account
3. **Upload Data**:
   - Upload your bar stock CSV (see `sample-bar-stock.csv`)
   - Upload recipe CSVs (see `sample-recipes.csv`)
4. **Analyze** - Click "Analyze My Bar" to see what you can make!
5. **AI** (Optional) - Add your Anthropic API key to use the AI Bartender

---

## 📁 Project Structure

```
cocktail-analysis/
├── server/                    # Backend (Node.js + Express)
│   ├── server.cjs            # Main server file
│   ├── database.cjs          # SQLite database
│   ├── auth.cjs              # Authentication utilities
│   └── routes/               # API endpoints
│       ├── auth.cjs          # Login/signup
│       ├── inventory.cjs     # Bar stock CRUD
│       ├── recipes.cjs       # Recipe CRUD
│       └── user-data.cjs     # Favorites/history
├── src/                       # Frontend (ES Modules)
│   ├── index.html            # Main HTML (240 lines)
│   ├── main.js               # App orchestration (1,732 lines)
│   ├── app.js                # Global state
│   ├── services/             # Business logic
│   │   ├── authService.js    # Auth client
│   │   ├── apiService.js     # API communication
│   │   ├── authIntegration.js # UI integration
│   │   ├── storage.js        # localStorage
│   │   ├── analyzer.js       # Recipe matching
│   │   ├── aiService.js      # Claude API
│   │   └── csvParser.js      # CSV parsing
│   ├── utils/                # Helpers
│   │   ├── formatters.js     # XSS protection, formatting
│   │   ├── fuzzyMatch.js     # Ingredient matching
│   │   └── aliases.js        # Ingredient aliases
│   └── styles/               # CSS modules
├── public/                    # Static assets
├── cocktail.db               # SQLite database (auto-created)
├── .env                      # Environment variables (create from .env.example)
├── package.json              # Dependencies
└── vite.config.js            # Vite configuration
```

---

## 🎯 How It Works

### 1. Upload Your Inventory

CSV Format (12 columns):
```csv
Name,Stock Number,Liquor Type,Detailed Spirit Classification,Distillation Method,ABV (%),Distillery Location,Age Statement or Barrel Finish,Additional Notes,Profile (Nose),Palate,Finish
Hamilton 86 Demerara Rum,1,Rum,Demerara Rum,Pot Still,86,Guyana,2 Year Old,High ester funky notes,Ripe banana molasses,Rich spicy fruity,Long warming
```

### 2. Upload Recipes

CSV Format (4 columns):
```csv
Drink Name,Ingredients,Instructions,Glass
Mai Tai,"2 oz Aged Rum
1 oz Fresh Lime Juice
0.5 oz Orange Curaçao
0.25 oz Orgeat
0.25 oz Simple Syrup","Shake all ingredients with ice. Strain into glass filled with crushed ice. Garnish with mint and lime.","Rocks Glass"
```

### 3. Analyze Your Bar

The app uses fuzzy matching to find:
- **Perfect Matches** (100%): You have everything!
- **Very Good** (80-99%): Missing 1-2 ingredients
- **Good** (60-79%): Close matches worth considering

### 4. Get Recommendations

Ask the AI Bartender:
- "What can I make with rum and lime?"
- "I'm out of orgeat, what can I substitute?"
- "Recommend something for a summer party"
- "Tell me about the history of the Old Fashioned"

---

## 🔐 Authentication & Security

### User Accounts
- **Email/Password**: Standard authentication
- **JWT Tokens**: 7-day expiration
- **Secure Storage**: Passwords hashed with bcrypt (10 rounds)
- **Data Isolation**: Each user has their own data

### API Security
- **Protected Routes**: All data endpoints require authentication
- **SQL Injection**: Prevented with prepared statements
- **XSS Protection**: HTML escaping on user input
- **CORS**: Enabled for local development

### Privacy
- ✅ Data stored on your server only
- ✅ Passwords never stored in plaintext
- ✅ No data sent to third parties (except Anthropic for AI features)
- ✅ Full control over your data

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login and get JWT
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Data Management (Protected)
- `GET /api/inventory` - Get bar stock
- `POST /api/inventory` - Save bar stock
- `GET /api/recipes` - Get recipes
- `POST /api/recipes` - Save recipes
- `GET /api/user-data/favorites` - Get favorites
- `POST /api/user-data/favorites` - Save favorites
- `GET /api/user-data/history` - Get history
- `POST /api/user-data/history` - Save history

### AI Proxy
- `POST /api/messages` - Anthropic Claude API proxy

See [IMPLEMENTATION.md](./IMPLEMENTATION.md) for full API documentation.

---

## 🛠️ Development

### Build for Production

```bash
npm run build
```

### Linting

```bash
npm run lint
npm run lint:fix
```

### Code Formatting

```bash
npm run format
```

### Environment Variables

Create `.env` from `.env.example`:

```env
PORT=3000
JWT_SECRET=your-super-secret-key-change-this
DB_PATH=./cocktail.db
ANTHROPIC_API_KEY=  # Optional
```

**⚠️ Important:** Change `JWT_SECRET` to a long random string in production!

---

## 📚 Documentation

- **[IMPLEMENTATION.md](./IMPLEMENTATION.md)** - Complete implementation guide
- **[AUTH_FEATURES.md](./AUTH_FEATURES.md)** - Authentication deep dive
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history
- **[MIGRATION.md](./MIGRATION.md)** - Migration from v5.0 to v6.0
- **[GIT_WORKFLOW.md](./GIT_WORKFLOW.md)** - Git workflow guide

---

## 🐛 Troubleshooting

### Server won't start
```bash
# Rebuild SQLite bindings
npm rebuild better-sqlite3
```

### Port already in use
```bash
# Change PORT in .env or kill process
lsof -ti:3000 | xargs kill -9
```

### Can't login
1. Check server is running on port 3000
2. Verify credentials
3. Check browser console for errors

### Data not syncing
1. Verify you're logged in (email shows in sidebar)
2. Check network tab for API errors
3. Ensure server is running

See [IMPLEMENTATION.md](./IMPLEMENTATION.md#troubleshooting) for more help.

---

## 🎨 Tech Stack

**Frontend:**
- Vanilla JavaScript (ES Modules)
- Vite (development & build)
- PapaParse (CSV parsing)
- Modern CSS (CSS Grid, Flexbox)

**Backend:**
- Node.js + Express
- better-sqlite3 (SQLite database)
- JWT (authentication)
- bcrypt (password hashing)

**External APIs:**
- Anthropic Claude (AI bartending)

---

## 📊 Stats

- **Frontend**: ~2,000 lines of JavaScript across 15+ modules
- **Backend**: ~750 lines across server, database, and routes
- **Documentation**: 6 comprehensive guides
- **CSV Support**: 12-column inventory format
- **Database**: 5 tables with indexes
- **Security**: JWT + bcrypt + prepared statements
- **Auto-sync**: Every 30 seconds

---

## 🗺️ Roadmap

### Completed ✅
- ✅ Modular architecture (v5.0)
- ✅ User authentication (v6.0)
- ✅ Data persistence (v6.0)
- ✅ Auto-sync functionality (v6.0)
- ✅ Bug fixes and refinements (v6.0)

### Future Enhancements 🔮
- 🔄 Password reset functionality
- 🔄 Email verification
- 🔄 Social login (Google, GitHub)
- 🔄 Shared collections
- 🔄 Public recipe sharing
- 🔄 Mobile app
- 🔄 Advanced analytics
- 🔄 Recipe recommendations

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

---

## 🙏 Acknowledgments

- **Anthropic** for the Claude API
- **PapaParse** for excellent CSV parsing
- **better-sqlite3** for fast, reliable SQLite
- **Vite** for lightning-fast development

---

## 📬 Support

For issues, questions, or feature requests:
1. Check the [documentation](./IMPLEMENTATION.md)
2. Review [troubleshooting guide](./IMPLEMENTATION.md#troubleshooting)
3. Open an issue on GitHub

---

## 🎉 Quick Commands Reference

```bash
# Install
npm install && npm rebuild better-sqlite3

# Run everything
npm run dev:all

# Run separately
npm run server  # Backend on :3000
npm run dev     # Frontend on :5173

# Build
npm run build

# Lint & Format
npm run lint
npm run format
```

---

**Built with ❤️ using Claude Code**

Version 6.0.0 | [View Implementation Guide](./IMPLEMENTATION.md)
