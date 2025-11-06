// Script to update a user's password in the database
require('dotenv').config();
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3');

const dbPath = process.env.DATABASE_PATH || './server/database/cocktail-analyzer.db';
const SALT_ROUNDS = 10;

const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.error('❌ Usage: node update-password.js <email> <new-password>');
  console.error('Example: node update-password.js jacob.lawrence11@gmail.com Cocktail2024');
  console.error('');
  console.error('⚠️  Password must meet requirements:');
  console.error('  - At least 8 characters');
  console.error('  - At least 1 uppercase letter');
  console.error('  - At least 1 lowercase letter');
  console.error('  - At least 1 number');
  process.exit(1);
}

// Validate password meets requirements
if (newPassword.length < 8) {
  console.error('❌ Password must be at least 8 characters long');
  process.exit(1);
}

if (!/[A-Z]/.test(newPassword)) {
  console.error('❌ Password must contain at least one uppercase letter');
  process.exit(1);
}

if (!/[a-z]/.test(newPassword)) {
  console.error('❌ Password must contain at least one lowercase letter');
  process.exit(1);
}

if (!/[0-9]/.test(newPassword)) {
  console.error('❌ Password must contain at least one number');
  process.exit(1);
}

console.log('🔄 Updating password for:', email);
console.log('');

bcrypt.hash(newPassword, SALT_ROUNDS, (err, hash) => {
  if (err) {
    console.error('❌ Error hashing password:', err);
    process.exit(1);
  }

  const db = new sqlite3.Database(dbPath);

  db.run('UPDATE users SET password_hash = ? WHERE email = ?', [hash, email], function(err) {
    if (err) {
      console.error('❌ Error updating password:', err);
      db.close();
      process.exit(1);
    }

    if (this.changes === 0) {
      console.log('❌ User not found in database');
      console.log('');
      console.log('Available users:');
      db.all('SELECT email FROM users', [], (err, rows) => {
        if (err) {
          console.error('Error listing users:', err);
        } else if (rows.length === 0) {
          console.log('  (no users in database)');
        } else {
          rows.forEach(row => console.log('  -', row.email));
        }
        db.close();
        process.exit(1);
      });
    } else {
      console.log('✅ Password updated successfully!');
      console.log('');
      console.log('You can now login with:');
      console.log('  Email:', email);
      console.log('  Password:', newPassword);
      db.close();
      process.exit(0);
    }
  });
});
