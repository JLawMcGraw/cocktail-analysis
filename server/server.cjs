require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Debug: Check environment configuration on startup
console.log('🔍 Environment check:');
console.log('  NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('  PORT:', process.env.PORT || 3000);
console.log('  ANTHROPIC_API_KEY exists?', !!process.env.ANTHROPIC_API_KEY);
console.log('  ANTHROPIC_API_KEY valid format?', process.env.ANTHROPIC_API_KEY?.startsWith('sk-ant-') || false);

const { initializeDatabase } = require('./database/db.cjs');
const authRoutes = require('./routes/auth.cjs');
const inventoryRoutes = require('./routes/inventory.cjs');
const recipesRoutes = require('./routes/recipes.cjs');
const favoritesRoutes = require('./routes/favorites.cjs');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database on startup
(async () => {
  try {
    await initializeDatabase();
    console.log('✅ Database ready');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  }
})();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// API Routes
app.use('/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/recipes', recipesRoutes);
app.use('/api/favorites', favoritesRoutes);

// Anthropic API Proxy - using fetch for better compatibility
app.post('/api/messages', async (req, res) => {
  // Use server-side API key from environment
  const apiKey = process.env.ANTHROPIC_API_KEY;

  console.log('🔍 DEBUG: API Key exists?', !!apiKey);
  console.log('🔍 DEBUG: API Key length:', apiKey ? apiKey.length : 0);
  console.log('🔍 DEBUG: API Key starts with:', apiKey ? apiKey.substring(0, 15) : 'N/A');

  if (!apiKey || apiKey === 'your-anthropic-api-key-here') {
    console.error('❌ AI Proxy: No API key configured on server');
    return res.status(500).json({
      error: 'AI feature not configured',
      message: 'Server administrator needs to add ANTHROPIC_API_KEY to .env file.'
    });
  }

  try {
    console.log('🤖 AI Proxy: Forwarding request to Anthropic API...');
    console.log('📤 Request body:', JSON.stringify(req.body).substring(0, 200) + '...');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(req.body),
    });

    console.log('   Response status:', response.status);

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ AI Proxy Error:', {
        status: response.status,
        error: data
      });
      return res.status(response.status).json(data);
    }

    console.log('✅ AI Proxy: Request successful');
    res.json(data);
  } catch (error) {
    console.error('❌ AI Proxy network error:', error.message);
    console.error('❌ Full error:', error);
    res.status(500).json({
      error: 'Failed to connect to Anthropic API',
      details: error.message,
      tip: 'Check server internet connection and API key validity.'
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Serve static files in production (after API routes)
if (process.env.NODE_ENV === 'production') {
  const path = require('path');

  // Serve built frontend files
  app.use(express.static(path.join(__dirname, '../dist')));

  // Serve index.html for all non-API routes (SPA routing)
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });

  console.log('📦 Serving static files from /dist');
}

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log('');
  console.log('🚀 Cocktail Analyzer Server');
  console.log(`📍 Server running on http://localhost:${PORT}`);
  console.log('');
  console.log('📋 Authentication Endpoints:');
  console.log(`  POST   /auth/signup          - Create account`);
  console.log(`  POST   /auth/login           - Login`);
  console.log(`  GET    /auth/me              - Get profile (protected)`);
  console.log(`  POST   /auth/logout          - Logout (protected)`);
  console.log('');
  console.log('📋 API Endpoints (all protected):');
  console.log(`  GET    /api/inventory        - Get inventory`);
  console.log(`  POST   /api/inventory        - Add item`);
  console.log(`  POST   /api/inventory/bulk   - Bulk upload`);
  console.log(`  PUT    /api/inventory/:id    - Update item`);
  console.log(`  DELETE /api/inventory/:id    - Delete item`);
  console.log('');
  console.log(`  GET    /api/recipes          - Get recipes`);
  console.log(`  POST   /api/recipes          - Add recipe`);
  console.log(`  POST   /api/recipes/bulk     - Bulk upload`);
  console.log(`  PUT    /api/recipes/:id      - Update recipe`);
  console.log(`  DELETE /api/recipes/:id      - Delete recipe`);
  console.log('');
  console.log(`  GET    /api/favorites        - Get favorites`);
  console.log(`  POST   /api/favorites        - Add favorite`);
  console.log(`  DELETE /api/favorites/:name  - Remove favorite`);
  console.log(`  GET    /api/favorites/history - Get history`);
  console.log(`  POST   /api/favorites/history - Update history`);
  console.log('');
  console.log(`  POST   /api/messages         - Anthropic AI proxy`);
  console.log('');
  console.log(`💡 Frontend: Run "npm run dev" in another terminal`);
  console.log('');
});

module.exports = app;
