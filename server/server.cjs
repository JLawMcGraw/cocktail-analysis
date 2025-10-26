const express = require('express');
const cors = require('cors');
const https = require('https');
const helmet = require('helmet');
require('dotenv').config();

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

// Anthropic API Proxy
app.post('/api/messages', (req, res) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    console.error('❌ AI Proxy: Missing API key');
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Missing x-api-key header. Please add your Anthropic API key in the AI tab.' }));
    return;
  }

  console.log('🤖 AI Proxy: Forwarding request to Anthropic API...');

  const options = {
    hostname: 'api.anthropic.com',
    port: 443,
    path: '/v1/messages',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
  };

  let responseData = '';

  const proxyReq = https.request(options, (proxyRes) => {
    console.log(`   Response status: ${proxyRes.statusCode}`);

    res.writeHead(proxyRes.statusCode, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    });

    proxyRes.on('data', (chunk) => {
      responseData += chunk.toString();
      res.write(chunk);
    });

    proxyRes.on('end', () => {
      if (proxyRes.statusCode !== 200) {
        console.error('❌ AI Proxy Error:', {
          status: proxyRes.statusCode,
          response: responseData.substring(0, 500)
        });
      } else {
        console.log('✅ AI Proxy: Request successful');
      }
      res.end();
    });
  });

  proxyReq.on('error', (error) => {
    console.error('❌ AI Proxy network error:', error.message);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Failed to connect to Anthropic API',
      details: error.message,
      tip: 'Check your internet connection and API key validity'
    }));
  });

  let body = '';
  req.on('data', (chunk) => {
    body += chunk.toString();
  });

  req.on('end', () => {
    try {
      // Validate JSON before sending
      JSON.parse(body);
      proxyReq.write(body);
      proxyReq.end();
    } catch (error) {
      console.error('❌ AI Proxy: Invalid JSON in request body');
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid request format' }));
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

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
