// Temporary script to reset database on Railway
const fs = require('fs');
const path = require('path');

const dbPath = process.env.DATABASE_PATH || './server/database/cocktail-analyzer.db';

console.log('🔄 Attempting to reset database...');
console.log('Database path:', dbPath);

if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('✅ Database deleted successfully');
} else {
  console.log('ℹ️  Database file does not exist');
}

console.log('🔄 Database will be recreated on next server start');
process.exit(0);
