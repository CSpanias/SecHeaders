// server.js
// PoC server with selectable Referrer-Policy modes
// Usage examples:
//   REFERRER=NONE node server.js
//   REFERRER=STRICT node server.js
//   REFERRER=NO_REFERRER node server.js
//   REFERRER=NO_REFERRER_WHEN_DOWNGRADE node server.js

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;

// Map short names to header values
const REF_MAP = {
  NONE: null, // don't set header
  STRICT: 'strict-origin-when-cross-origin',
  NO_REFERRER: 'no-referrer',
  NO_REFERRER_WHEN_DOWNGRADE: 'no-referrer-when-downgrade'
};

const mode = (process.env.REFERRER || 'NONE').toUpperCase();
const headerValue = REF_MAP.hasOwnProperty(mode) ? REF_MAP[mode] : null;

console.log(`Starting server on http://localhost:${PORT}`);
console.log(`Referrer-Policy mode: ${mode}${headerValue ? ` -> ${headerValue}` : ' (no header set)'}`);

function sendFile(res, filepath, headers = {}) {
  fs.readFile(filepath, (err, data) => {
    if (err) {
      res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'});
      return res.end('Not found');
    }
    // set provided headers
    Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  // Optionally set Referrer-Policy header globally
  if (headerValue) {
    res.setHeader('Referrer-Policy', headerValue);
  }

  const url = req.url.split('?')[0];

  // log Referer for visibility on any request to /leak.html or general logging
  if (url === '/leak.html') {
    console.log(`Referer received: ${req.headers.referer || '(none)'}`);
  }

  if (url === '/' || url === '/victim.html') {
    return sendFile(res, path.join(ROOT, 'victim.html'));
  }

  if (url === '/leak.html') {
    return sendFile(res, path.join(ROOT, 'leak.html'));
  }

  // fallback: serve static files if present (e.g., CSS/JS), otherwise 404
  const staticPath = path.join(ROOT, decodeURIComponent(url));
  if (fs.existsSync(staticPath) && fs.statSync(staticPath).isFile()) {
    const ext = path.extname(staticPath).toLowerCase();
    const mime = ext === '.js' ? 'application/javascript' :
                 ext === '.css' ? 'text/css' :
                 'application/octet-stream';
    const data = fs.readFileSync(staticPath);
    if (headerValue) res.setHeader('Referrer-Policy', headerValue);
    res.writeHead(200, { 'Content-Type': mime });
    return res.end(data);
  }

  res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'});
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log('Server ready.');
  console.log('Try:');
  console.log(`  curl -I "http://localhost:${PORT}/victim.html?secret=LEAKME"`);
  console.log(`  Open: http://localhost:${PORT}/victim.html?secret=LEAKME`);
  console.log('Change referrer mode with: REFERRER=NO_REFERRER node server.js');
});
