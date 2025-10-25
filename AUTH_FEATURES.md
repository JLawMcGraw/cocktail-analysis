# User Authentication & Data Persistence

**Version 6.0.0** - Built on the modern modular architecture

## Overview

The Cocktail Compatibility Analyzer now includes full user authentication and server-side data persistence. Your bar stock, recipes, favorites, and history are saved to the server and accessible from any device.

## Features

### User Accounts
- **Sign Up**: Create a new account with email and password
- **Login**: Secure JWT-based authentication
- **Logout**: Clean session termination with data sync

### Persistent Data
All your data is automatically saved to the server:
- **Bar Stock/Inventory**: Your bottle collection
- **Recipes**: Custom recipe collections
- **Favorites**: Favorited cocktails
- **History**: Ratings, notes, and "made" status

### Auto-Sync
- Syncs every 30 seconds while authenticated
- Syncs on logout and page close
- Real-time updates across devices

## Quick Start

### 1. Start the Server

```bash
npm run server
```

The server runs on `http://localhost:3000`

### 2. Start the Frontend

In a separate terminal:

```bash
npm run dev
```

The frontend runs on `http://localhost:5173` (Vite dev server)

### 3. Use Both Together

```bash
npm run dev:all
```

This starts both the server and frontend concurrently.

## Usage

### Creating an Account

1. Open the app in your browser
2. Click "Sign Up" in the sidebar
3. Enter your email and password (min 6 characters)
4. Click "Create Account"

### Logging In

1. Click "Login" in the sidebar
2. Enter your credentials
3. Your data will load automatically

### Uploading Data

Once logged in:
1. Upload your bar stock CSV
2. Upload your recipe CSV(s)
3. Data is automatically synced to the server

## Architecture

### Backend (CommonJS)

```
server/
├── server.cjs           # Express server
├── database.cjs         # SQLite database
├── auth.cjs             # JWT utilities
└── routes/
    ├── auth.cjs         # Authentication endpoints
    ├── inventory.cjs    # Inventory API
    ├── recipes.cjs      # Recipes API
    └── user-data.cjs    # Favorites & history
```

### Frontend (ES Modules)

```
src/services/
├── authService.js       # Authentication client
├── apiService.js        # API communication
└── authIntegration.js   # UI integration & auto-sync
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login and get JWT
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Data Management
- `GET/POST /api/inventory` - Bar stock
- `GET/POST /api/recipes` - Recipes
- `GET/POST /api/user-data/favorites` - Favorites
- `GET/POST /api/user-data/history` - History

### AI Proxy
- `POST /api/messages` - Anthropic API proxy

## Database

**SQLite** database stored in `cocktail.db`

### Schema

- **users**: User accounts (email, password_hash)
- **inventory**: User bar stock (JSON)
- **recipes**: User recipes (JSON)
- **favorites**: User favorites (JSON)
- **history**: User ratings/notes (JSON)

## Security

- **Password Hashing**: Bcrypt with 10 salt rounds
- **JWT Tokens**: 7-day expiration
- **Protected Routes**: All data endpoints require authentication
- **Prepared Statements**: SQL injection protection
- **Input Validation**: Email format and password length checks

## Environment Variables

Create `.env` based on `.env.example`:

```env
PORT=3000
JWT_SECRET=your-secret-key-change-in-production
DB_PATH=./cocktail.db
ANTHROPIC_API_KEY=  # Optional
```

**Important**: Change `JWT_SECRET` in production!

## Development

### File Structure

```
server/               # Backend (CommonJS)
  *.cjs              # Server files
src/                 # Frontend (ES Modules)
  services/
    authService.js
    apiService.js
    authIntegration.js
  index.html         # With auth UI
  main.js            # Initializes auth
```

### Why .cjs Extension?

The project uses ES modules (`"type": "module"`), but `better-sqlite3` requires CommonJS. Using `.cjs` extension allows mixing both module systems.

## Troubleshooting

### Server won't start
```bash
npm install
npm rebuild better-sqlite3
npm run server
```

### Can't login
- Verify server is running on port 3000
- Check browser console for errors
- Clear browser cache

### Data not syncing
- Check authentication status
- Verify server is running
- Check browser console for API errors

## Migration from v5.0

If you have data in v5.0 (localStorage only):

1. **Export** your data in v5.0 using "Export Data"
2. **Start** the v6.0 server
3. **Create** an account
4. **Import** your data using "Import Data"
5. Data is now persisted!

## Database Management

### Backup
```bash
cp cocktail.db cocktail.db.backup
```

### Reset
```bash
rm cocktail.db
npm run server  # Creates new database
```

### View Data
```bash
sqlite3 cocktail.db
.tables
SELECT * FROM users;
```

## Testing

### Test Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Save Inventory
```bash
curl -X POST http://localhost:3000/api/inventory \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"inventory":[{"Name":"Rum","Stock Number":1}]}'
```

## Privacy

- Data stored locally on your server
- Passwords hashed (never stored in plaintext)
- No data sent to third parties (except Anthropic API for AI features)
- JWT tokens expire after 7 days

## Future Enhancements

- Password reset functionality
- Email verification
- Social login (Google, GitHub)
- Shared collections
- Public/private recipe sharing
- Data encryption at rest

## Support

For issues or questions, check:
- This documentation
- Code comments in source files
- GitHub issues

## License

MIT License
