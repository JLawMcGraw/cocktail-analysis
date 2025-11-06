// Script to delete a specific user from the database
require('dotenv').config();
const sqlite3 = require('sqlite3');

const dbPath = process.env.DATABASE_PATH || './server/database/cocktail-analyzer.db';
const emailToDelete = process.argv[2];

if (!emailToDelete) {
  console.error('❌ Usage: node delete-user.js <email>');
  console.error('Example: node delete-user.js jacob.lawrence11@gmail.com');
  process.exit(1);
}

const db = new sqlite3.Database(dbPath);

console.log(`🔄 Attempting to delete user: ${emailToDelete}`);

db.run('DELETE FROM users WHERE email = ?', [emailToDelete], function(err) {
  if (err) {
    console.error('❌ Error deleting user:', err);
    db.close();
    process.exit(1);
  }

  if (this.changes === 0) {
    console.log('ℹ️  User not found in database');
  } else {
    console.log('✅ User deleted successfully');
  }

  db.close();
  process.exit(0);
});
