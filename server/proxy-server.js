/**
 * Simple proxy server for Anthropic API calls
 * This solves CORS issues when calling the API directly from the browser
 *
 * Usage:
 * 1. Install dependencies: npm install
 * 2. Run server: node proxy-server.js
 * 3. Server runs on http://localhost:3000
 */

const http = require('http');
const https = require('https');

const PORT = 3000;
const ANTHROPIC_API = 'api.anthropic.com';

const server = http.createServer((req, res) => {
    // Enable CORS for browser requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Only handle POST requests to /api/messages
    if (req.method !== 'POST' || req.url !== '/api/messages') {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
        return;
    }

    let body = '';

    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        try {
            const data = JSON.parse(body);
            const apiKey = req.headers['x-api-key'];

            if (!apiKey) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'API key required' }));
                return;
            }

            // Forward request to Anthropic API
            const options = {
                hostname: ANTHROPIC_API,
                path: '/v1/messages',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01'
                }
            };

            const proxyReq = https.request(options, (proxyRes) => {
                let responseBody = '';

                proxyRes.on('data', chunk => {
                    responseBody += chunk;
                });

                proxyRes.on('end', () => {
                    res.writeHead(proxyRes.statusCode, {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    });
                    res.end(responseBody);
                });
            });

            proxyReq.on('error', (error) => {
                console.error('Proxy request error:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Proxy request failed: ' + error.message }));
            });

            proxyReq.write(JSON.stringify(data));
            proxyReq.end();

        } catch (error) {
            console.error('Server error:', error);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Bad request: ' + error.message }));
        }
    });
});

server.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🍹 Cocktail Analyzer Proxy Server Running               ║
║                                                            ║
║   Server: http://localhost:${PORT}                           ║
║   Status: Ready to proxy requests to Anthropic API        ║
║                                                            ║
║   Next Steps:                                              ║
║   1. Open index.html in your browser                       ║
║   2. The app will automatically use this proxy             ║
║   3. Enter your API key and start querying!                ║
║                                                            ║
║   Press Ctrl+C to stop the server                          ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);
});

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`
❌ Error: Port ${PORT} is already in use.

Solutions:
1. Stop the other process using port ${PORT}
2. Or change the PORT in this file and index.html
        `);
    } else {
        console.error('Server error:', error);
    }
    process.exit(1);
});
