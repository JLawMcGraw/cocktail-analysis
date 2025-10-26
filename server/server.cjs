const express = require('express');
const cors = require('cors');
const https = require('https');
require('dotenv').config();

const authRoutes = require('./routes/auth.cjs');
const inventoryRoutes = require('./routes/inventory.cjs');
const recipesRoutes = require('./routes/recipes.cjs');
const userDataRoutes = require('./routes/user-data.cjs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/recipes', recipesRoutes);
app.use('/api/user-data', userDataRoutes);

// Anthropic API Proxy
app.post('/api/messages', (req, res) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Missing x-api-key header' }));
    return;
  }

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

  const proxyReq = https.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    });

    proxyRes.on('data', (chunk) => {
      res.write(chunk);
    });

    proxyRes.on('end', () => {
      res.end();
    });
  });

  proxyReq.on('error', (error) => {
    console.error('Proxy request error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Proxy request failed', details: error.message }));
  });

  let body = '';
  req.on('data', (chunk) => {
    body += chunk.toString();
  });

  req.on('end', () => {
    proxyReq.write(body);
    proxyReq.end();
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
  console.log(`\nServer running on http://localhost:${PORT}`);
  console.log(`\nAPI endpoints:`);
  console.log(`  POST   /api/auth/signup`);
  console.log(`  POST   /api/auth/login`);
  console.log(`  GET    /api/auth/me`);
  console.log(`  POST   /api/auth/logout`);
  console.log(`  GET    /api/inventory`);
  console.log(`  POST   /api/inventory`);
  console.log(`  GET    /api/recipes`);
  console.log(`  POST   /api/recipes`);
  console.log(`  GET    /api/user-data/favorites`);
  console.log(`  POST   /api/user-data/favorites`);
  console.log(`  GET    /api/user-data/history`);
  console.log(`  POST   /api/user-data/history`);
  console.log(`  POST   /api/messages (Anthropic proxy)`);
  console.log(`\nFrontend: Run "npm run dev" in another terminal\n`);
});

module.exports = app;
