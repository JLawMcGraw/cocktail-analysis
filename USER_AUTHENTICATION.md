# User Authentication & Data Persistence

Version 4.0.0 introduces user authentication and server-side data persistence to the Cocktail Compatibility Analyzer.

## Features

### User Accounts
- **Sign Up**: Create a new account with email and password
- **Login**: Access your account from any device
- **Logout**: Securely end your session

### Persistent Data
Your data is now saved to the server and synced across devices:
- **Bar Stock (Inventory)**: Your bottle collection persists when you log in
- **Recipes**: Custom recipe collections are saved to your account
- **Favorites**: Favorite cocktails are preserved
- **History**: Ratings and notes are maintained

### Auto-Sync
- Data automatically syncs to the server every 30 seconds
- Data syncs when you logout or close the browser
- Changes are saved in real-time

## Getting Started

### For Users

1. **Start the Server**
   ```bash
   npm start
   ```

2. **Open the App**
   - Open `index.html` in your browser
   - Or visit `http://localhost:3000` if serving via HTTP

3. **Create an Account**
   - Click "Sign Up" in the sidebar
   - Enter your email and password (minimum 6 characters)
   - Click "Create Account"

4. **Upload Your Data**
   - Upload your bar stock CSV
   - Upload your recipe CSV(s)
   - Data is automatically saved to your account

5. **Access from Any Device**
   - Login with your credentials
   - Your data will be automatically loaded

### For Developers

#### Architecture

**Backend (Node.js + Express + SQLite)**
- `server/server.js` - Main Express server
- `server/database.js` - SQLite database setup and queries
- `server/auth.js` - JWT authentication utilities
- `server/routes/` - API endpoints
  - `auth.js` - Authentication endpoints
  - `inventory.js` - Inventory CRUD
  - `recipes.js` - Recipes CRUD
  - `user-data.js` - Favorites and history

**Frontend**
- `auth-client.js` - Authentication client
- `api-client.js` - API communication layer
- `auth-integration.js` - UI integration and auto-sync

**Database Schema**
- `users` - User accounts (email, password_hash)
- `inventory` - User bar stock (JSON)
- `recipes` - User recipes (JSON)
- `favorites` - User favorites (JSON)
- `history` - User history/ratings (JSON)

#### API Endpoints

**Authentication**
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login and receive JWT token
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout

**Data Management**
- `GET /api/inventory` - Get user's bar stock
- `POST /api/inventory` - Save bar stock
- `GET /api/recipes` - Get user's recipes
- `POST /api/recipes` - Save recipes
- `GET /api/user-data/favorites` - Get favorites
- `POST /api/user-data/favorites` - Save favorites
- `GET /api/user-data/history` - Get history
- `POST /api/user-data/history` - Save history

**AI Proxy**
- `POST /api/messages` - Anthropic API proxy (unchanged)

#### Environment Variables

Create a `.env` file based on `.env.example`:

```env
PORT=3000
JWT_SECRET=your-secret-key-change-this-in-production
DB_PATH=./cocktail.db
ANTHROPIC_API_KEY=  # Optional
```

**IMPORTANT**: Change `JWT_SECRET` to a random string in production!

#### Security Features

- **Password Hashing**: Bcrypt with 10 salt rounds
- **JWT Tokens**: 7-day expiration
- **Protected Routes**: All data endpoints require authentication
- **SQL Injection Protection**: Prepared statements
- **Input Validation**: Email format, password length checks

## Migrating from v3.x

If you have data in v3.x (localStorage only):

1. **Export your data** in v3.x using the "Export Data" button
2. **Install and start the v4.0 server**
3. **Create an account**
4. **Import your data** using the "Import Data" button
5. Your data is now persisted to your account!

## Database Management

### Backup Database
```bash
cp cocktail.db cocktail.db.backup
```

### Reset Database
```bash
rm cocktail.db
npm start  # Database will be recreated
```

### View Database
```bash
sqlite3 cocktail.db
.tables
.schema users
SELECT * FROM users;
```

## Troubleshooting

### Server won't start
- Check if port 3000 is available
- Ensure all dependencies are installed: `npm install`
- Check console for error messages

### Can't login
- Verify credentials are correct
- Check that server is running
- Clear browser cache and try again

### Data not syncing
- Check browser console for errors
- Verify you're logged in
- Check server logs for errors
- Ensure you have a network connection

### better-sqlite3 errors
If you see binding errors, rebuild the package:
```bash
npm rebuild better-sqlite3
```

## Privacy & Data

- All data is stored locally on your server
- Passwords are hashed with bcrypt (never stored in plaintext)
- JWT tokens expire after 7 days
- No data is sent to third parties (except Anthropic API for AI features)

## Future Enhancements

Potential features for future versions:
- Password reset functionality
- Email verification
- Social login (Google, GitHub, etc.)
- Shared collections between users
- Public/private recipe sharing
- Multi-device notifications
- Data encryption at rest

## Support

For issues or questions:
- Check this documentation
- Review the code comments
- Open an issue on GitHub

## License

MIT License - See LICENSE file for details
