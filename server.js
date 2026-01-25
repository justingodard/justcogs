const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const DISCOGS_API_BASE = 'https://api.discogs.com';

// Load config (credentials stored server-side only)
let config;
try {
    config = require('./config.js');
} catch (err) {
    console.error('❌ Error: config.js not found. Please create it with your Discogs credentials.');
    console.error('   See config.js.example for reference.');
    process.exit(1);
}

if (!config.discogs.username || !config.discogs.token || 
    config.discogs.username === 'YOUR_DISCOGS_USERNAME' || 
    config.discogs.token === 'YOUR_DISCOGS_API_TOKEN') {
    console.error('❌ Error: Please update config.js with your actual Discogs username and token.');
    process.exit(1);
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);

    // Serve static files
    if (parsedUrl.pathname === '/' || parsedUrl.pathname === '/index.html') {
        const filePath = path.join(__dirname, 'index.html');
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading page');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
        return;
    }

    // User info endpoint (returns username only, no sensitive data)
    if (parsedUrl.pathname === '/api/user-info') {
        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ username: config.discogs.username }));
        return;
    }

    // API proxy endpoint
    if (parsedUrl.pathname.startsWith('/api/')) {
        const apiPath = parsedUrl.pathname.replace('/api', '');
        const queryString = parsedUrl.search || '';
        const discogsUrl = `${DISCOGS_API_BASE}${apiPath}${queryString}`;

        // Use credentials from config (server-side only)
        const username = config.discogs.username;
        const token = config.discogs.token;

        // Make request to Discogs API
        const options = {
            headers: {
                'User-Agent': 'Justcogs/1.0',
                'Authorization': `Discogs token=${token}`
            }
        };

        https.get(discogsUrl, options, (discogsRes) => {
            let data = '';

            discogsRes.on('data', (chunk) => {
                data += chunk;
            });

            discogsRes.on('end', () => {
                res.writeHead(discogsRes.statusCode, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(data);
            });
        }).on('error', (err) => {
            res.writeHead(500, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({ error: err.message }));
        });

        return;
    }

    // Serve cached data files
    if (parsedUrl.pathname.startsWith('/data/')) {
        const filePath = path.join(__dirname, parsedUrl.pathname);
        // Security: ensure the path is within the data directory
        const dataDir = path.join(__dirname, 'data');
        if (!filePath.startsWith(dataDir)) {
            res.writeHead(403);
            res.end('Forbidden');
            return;
        }
        
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('Not found');
                return;
            }
            res.writeHead(200, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(data);
        });
        return;
    }

    // 404 for other routes
    res.writeHead(404);
    res.end('Not found');
});

server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📱 Open http://localhost:${PORT} in your browser`);
});
