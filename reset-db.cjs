// Temporary script to reset database on Railway
const fs = require('fs');
const path = require('path');

const dbPath = process.env.DATABASE_PATH || './server/database/cocktail-analyzer.db';

console.log('🔄 Attempting to reset database...');
console.log('Database path:', dbPath);

try {
  // Ensure directory exists
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    console.log('📁 Creating database directory...');
    fs.mkdirSync(dbDir, { recursive: true });
  }

  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('✅ Database deleted successfully');
  } else {
    console.log('ℹ️  Database file does not exist (will be created on startup)');
  }

  console.log('🔄 Database will be recreated on server start');
} catch (error) {
  console.error('⚠️  Error during reset (non-fatal):', error.message);
}

// Always exit successfully to allow server to start
process.exit(0);
