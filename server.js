/**
 * Portfolio local dev server
 * Clean routing: /admin (not /admin.html), /contact (not /contact.html)
 * APIs: POST /save, POST /contact, GET /contact (JSON/HTML)
 *
 * Usage:  node server.js
 * Then open: http://localhost:3000
 */

const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
};

const server = http.createServer((req, res) => {

  // CORS headers (localhost only)
  res.setHeader('Access-Control-Allow-Origin', `http://localhost:${PORT}`);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // ── 301 Redirects for dirty URLs with .html ───────────────
  if (pathname === '/index.html') {
    res.writeHead(301, { 'Location': '/' });
    res.end();
    return;
  }

  if (pathname === '/admin.html') {
    res.writeHead(301, { 'Location': '/admin' });
    res.end();
    return;
  }

  if (pathname === '/contact.html') {
    res.writeHead(301, { 'Location': '/contact' });
    res.end();
    return;
  }

  // ── POST /save (Admin Portfolio Save) ────────────────────
  if (req.method === 'POST' && (pathname === '/save' || pathname === '/api/save')) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        const filePath = path.join(ROOT, 'portfolio-data.json');
        fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2), 'utf-8');
        console.log('[save] portfolio-data.json updated');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, message: 'Portfolio updated successfully' }));
      } catch (err) {
        console.error('[save] error:', err.message);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
    });
    return;
  }

  // ── POST /contact (Direct Contact Message Submission) ────
  if (req.method === 'POST' && (pathname === '/contact' || pathname === '/api/contact')) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        if (!payload.email || !payload.message) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, error: 'Email and message are required.' }));
          return;
        }

        const msgLogPath = path.join(ROOT, 'contact-messages.json');
        let existing = [];
        if (fs.existsSync(msgLogPath)) {
          try {
            existing = JSON.parse(fs.readFileSync(msgLogPath, 'utf-8'));
          } catch (_) {
            existing = [];
          }
        }

        const record = {
          id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
          name: payload.name || 'Anonymous',
          email: payload.email,
          subject: payload.subject || 'Direct Engagement',
          message: payload.message,
          receivedAt: new Date().toISOString(),
          ip: req.socket.remoteAddress || '127.0.0.1'
        };

        existing.unshift(record);
        fs.writeFileSync(msgLogPath, JSON.stringify(existing, null, 2), 'utf-8');
        console.log(`[contact] New message received from ${record.email}`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          ok: true,
          message: 'Message delivered directly to Roushan Khalid. Thank you!'
        }));
      } catch (err) {
        console.error('[contact] error:', err.message);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'Invalid JSON request payload' }));
      }
    });
    return;
  }

  // ── GET /contact (API JSON when requested via Accept header)
  if (req.method === 'GET' && (pathname === '/contact' || pathname === '/api/contact')) {
    const acceptHeader = req.headers['accept'] || '';
    const wantsJson = acceptHeader.includes('application/json') || parsedUrl.searchParams.get('format') === 'json';

    if (wantsJson) {
      try {
        const raw = fs.readFileSync(path.join(ROOT, 'portfolio-data.json'), 'utf-8');
        const data = JSON.parse(raw);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          ok: true,
          contact: data.contact || {},
          location: "Dhaka, Bangladesh",
          timezone: "Asia/Dhaka (UTC+6)"
        }));
        return;
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: err.message }));
        return;
      }
    }
  }

  // ── Clean URL routing for static files ────────────────────
  let candidateFile = null;

  if (pathname === '/' || pathname === '') {
    candidateFile = path.join(ROOT, 'index.html');
  } else if (pathname === '/admin' || pathname === '/admin/') {
    // Serve admin/index.html or admin.html
    const dirIndex = path.join(ROOT, 'admin', 'index.html');
    candidateFile = fs.existsSync(dirIndex) ? dirIndex : path.join(ROOT, 'admin.html');
  } else if (pathname === '/contact' || pathname === '/contact/') {
    // Serve contact/index.html
    const dirIndex = path.join(ROOT, 'contact', 'index.html');
    candidateFile = fs.existsSync(dirIndex) ? dirIndex : path.join(ROOT, 'index.html');
  } else {
    // Normal static file resolution
    const directPath = path.join(ROOT, pathname);
    if (fs.existsSync(directPath)) {
      const stat = fs.statSync(directPath);
      if (stat.isDirectory()) {
        const subIndex = path.join(directPath, 'index.html');
        if (fs.existsSync(subIndex)) candidateFile = subIndex;
      } else {
        candidateFile = directPath;
      }
    } else {
      // Check if pathname + .html exists
      const htmlCandidate = path.join(ROOT, pathname + '.html');
      if (fs.existsSync(htmlCandidate)) {
        candidateFile = htmlCandidate;
      }
    }
  }

  if (!candidateFile) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found: ' + pathname);
    return;
  }

  // Security: prevent path traversal
  if (!candidateFile.startsWith(ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  // Don't serve sensitive files (.env, .git, config generators)
  const base = path.basename(candidateFile);
  if (base.startsWith('.') || base === 'generate-admin-config.js' || base === 'info.txt' || base === 'contact-messages.json') {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.readFile(candidateFile, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found: ' + pathname);
      return;
    }
    const ext = path.extname(candidateFile).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n  ======================================================`);
  console.log(`  Portfolio Local Server Running with Clean URLs`);
  console.log(`  ======================================================`);
  console.log(`  • Home:     http://localhost:${PORT}/`);
  console.log(`  • Contact:  http://localhost:${PORT}/contact`);
  console.log(`  • Admin:    http://localhost:${PORT}/admin`);
  console.log(`  • APIs:     POST /save, POST /contact, GET /contact`);
  console.log(`  ======================================================\n`);
});
