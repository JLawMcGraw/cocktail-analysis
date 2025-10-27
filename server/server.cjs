const express = require('express');
const cors = require('cors');
const https = require('https');
const helmet = require('helmet');
require('dotenv').config();

// Configure global proxy support (must be before any HTTP requests)
const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy;
if (proxyUrl) {
  console.log('🌐 Configuring global proxy:', proxyUrl.split('@')[1] || proxyUrl.split('://')[1]);

  // Use global-agent to automatically proxy all HTTP/HTTPS requests
  const { bootstrap } = require('global-agent');
  bootstrap();

  // The GLOBAL_AGENT_HTTPS_PROXY env var is what global-agent looks for
  if (!process.env.GLOBAL_AGENT_HTTPS_PROXY) {
    process.env.GLOBAL_AGENT_HTTPS_PROXY = proxyUrl;
  }
}

// Debug: Check if .env loaded
console.log('🔍 .env file check on startup:');
console.log('  PORT:', process.env.PORT);
console.log('  ANTHROPIC_API_KEY exists?', !!process.env.ANTHROPIC_API_KEY);
console.log('  ANTHROPIC_API_KEY length:', process.env.ANTHROPIC_API_KEY ? process.env.ANTHROPIC_API_KEY.length : 0);
console.log('  HTTPS_PROXY:', process.env.HTTPS_PROXY || process.env.https_proxy || 'none');

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
  // Use server-side API key from environment
  const apiKey = process.env.ANTHROPIC_API_KEY;

  console.log('🔍 DEBUG: API Key exists?', !!apiKey);
  console.log('🔍 DEBUG: API Key length:', apiKey ? apiKey.length : 0);
  console.log('🔍 DEBUG: API Key starts with:', apiKey ? apiKey.substring(0, 15) : 'N/A');

  if (!apiKey || apiKey === 'your-anthropic-api-key-here') {
    console.error('❌ AI Proxy: No API key configured on server');
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'AI feature not configured',
      message: 'Server administrator needs to add ANTHROPIC_API_KEY to .env file. See .env.example for details.'
    }));
    return;
  }

  console.log('🤖 AI Proxy: Forwarding request to Anthropic API...');

  // global-agent automatically handles proxy for all requests
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
    console.log(`   Response headers:`, proxyRes.headers);

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
          response: responseData
        });
      } else {
        console.log('✅ AI Proxy: Request successful');
      }
      res.end();
    });
  });

  proxyReq.on('error', (error) => {
    console.error('❌ AI Proxy network error:', error.message);
    console.error('❌ Full error:', error);
    console.error('❌ Error code:', error.code);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Failed to connect to Anthropic API',
      details: error.message,
      code: error.code,
      tip: 'Check your internet connection and API key validity. If key starts with sk-ant-api03, it should be valid format.'
    }));
  });

  let body = '';
  req.on('data', (chunk) => {
    body += chunk.toString();
  });

  req.on('end', () => {
    try {
      // Validate JSON before sending
      const parsedBody = JSON.parse(body);
      console.log('📤 Sending to Anthropic:');
      console.log('   Model:', parsedBody.model);
      console.log('   Max tokens:', parsedBody.max_tokens);
      console.log('   Messages count:', parsedBody.messages?.length);
      console.log('   Body size:', body.length, 'bytes');

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
