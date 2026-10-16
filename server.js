// ============================================================================
// Royal Eye Solar Power – Local Development & Production Server
// Runs on http://localhost:3000 (Pillar 4: Node.js server.js)
// Zero-dependency pure Node.js HTTP server with SPA fallback & API endpoints
// ============================================================================

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
};

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost:3000'}`);
  const pathname = parsedUrl.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API: Health check endpoint
  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify(
        {
          status: 'online',
          app: 'Royal Eye Solar Power – Work Progress Platform',
          port: PORT,
          uptimeSeconds: Math.round(process.uptime()),
          nodeVersion: process.version,
          distExists: fs.existsSync(DIST_DIR),
          timestamp: new Date().toISOString(),
        },
        null,
        2
      )
    );
    return;
  }

  // API: System architecture info
  if (pathname === '/api/stack') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify(
        {
          stack: [
            { name: '1. GITHUB', role: 'Code Repository, Version Control & CI/CD trigger' },
            { name: '2. SUPABASE', role: 'Live Cloud PostgreSQL Database & Real-time WebSockets' },
            { name: '3. NETLIFY', role: 'Web Hosting, Global CDN & Automated Deployment' },
            { name: '4. NODE.JS (server.js)', role: 'Local Development Server (localhost:3000)' },
            { name: '5. HTML5 LOCALSTORAGE', role: 'Offline Browser Cache & Resilience Fallback' },
            { name: '6. WHATSAPP API / WEB', role: '1-Click Client Quotations & Marketing Pitch Delivery' },
            { name: '7. JSDELIVR / CDN', role: 'External JS Libraries & Icon Bundles' },
          ],
        },
        null,
        2
      )
    );
    return;
  }

  // If dist directory doesn't exist, provide a helpful UI guide
  if (!fs.existsSync(DIST_DIR)) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Royal Eye Solar Power – Node.js Local Server</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 40px 20px; line-height: 1.6; margin: 0; }
    .card { max-width: 680px; margin: 40px auto; background: #1e293b; border-radius: 16px; padding: 32px; border: 1px solid #334155; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
    h1 { color: #f59a10; font-size: 24px; margin-top: 0; display: flex; align-items: center; gap: 10px; }
    code { background: #0b1120; color: #38bdf8; padding: 3px 8px; border-radius: 6px; font-family: monospace; font-size: 14px; }
    .badge { display: inline-block; background: #0369a1; color: #fff; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; margin-bottom: 16px; }
    .btn { display: inline-block; background: #1a6ff0; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; margin-top: 16px; }
    .btn:hover { background: #2563eb; }
    ol { padding-left: 20px; color: #cbd5e1; }
    li { margin-bottom: 10px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">Node.js Server Active (Port ${PORT})</div>
    <h1>☀️ Royal Eye Solar Local Server</h1>
    <p>The Node.js server is running smoothly on <b>localhost:${PORT}</b>. To serve the complete production build, compile the Vite app with:</p>
    <ol>
      <li>Run <code>npm run build</code> in your terminal to generate the <code>dist/</code> bundle.</li>
      <li>Refresh this page, or run <code>npm run dev</code> for instant Hot Module Reloading on port 5173.</li>
    </ol>
    <p>API Endpoint test: <a href="/api/health" style="color: #38bdf8;">/api/health</a> · <a href="/api/stack" style="color: #38bdf8;">/api/stack</a></p>
  </div>
</body>
</html>
    `);
    return;
  }

  // Attempt to serve static file from dist
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(DIST_DIR, safePath);

  // If path is root or directory, point to index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  // If file doesn't exist, fallback to dist/index.html (SPA routing)
  if (!fs.existsSync(filePath)) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Internal Server Error: ${err.message}`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Cache immutable assets
    if (pathname.startsWith('/assets/')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      res.setHeader('Cache-Control', 'no-cache');
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`☀️  Royal Eye Solar Power – Local Node.js Server`);
  console.log(`📡  Server running at: http://localhost:${PORT}`);
  console.log(`🩺  Health Check:      http://localhost:${PORT}/api/health`);
  console.log(`======================================================\n`);
});
