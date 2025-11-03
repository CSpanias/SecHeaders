// server.js — single-file Node server that can enable nosniff via env var NOSNIFF=1
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const ROOT = __dirname;
const ENABLE_NOSNIFF = !!process.env.NOSNIFF;

function sendFile(res, filepath, headers = {}) {
  fs.readFile(filepath, (err, data) => {
    if (err) {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      return res.end('Not found');
    }
    res.writeHead(200, headers);
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);

  // Add nosniff header globally when enabled
  if (ENABLE_NOSNIFF) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }

  if (url === '/' || url === '/victim.html') {
    return sendFile(res, path.join(ROOT, 'victim.html'), {
      'Content-Type': 'text/html; charset=utf-8'
    });
  }

  if (url === '/script.js') {
    // INTENTIONAL: send a JavaScript file but declare an incorrect Content-Type
    // to demonstrate MIME sniffing behavior in browsers.
    return sendFile(res, path.join(ROOT, 'script.js'), {
      'Content-Type': 'text/plain; charset=utf-8'
      // NOTE: when ENABLE_NOSNIFF is true, X-Content-Type-Options: nosniff will also be present
    });
  }

  // fallback: 404
  res.writeHead(404, {'Content-Type': 'text/plain'});
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`Server listening: http://localhost:${PORT}/victim.html`);
  console.log(`X-Content-Type-Options nosniff is ${ENABLE_NOSNIFF ? 'ENABLED' : 'DISABLED'}`);
});
