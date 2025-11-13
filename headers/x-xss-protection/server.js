// server.js
// Run: NOSXSP=1 node server.js  (enable header when NOSXSP is truthy)
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT || 3000);
const ENABLE_XXSP = !!process.env.XXSP; // set XXSP=1 to enable X-XSS-Protection header

const ROOT = __dirname;

function sendFile(res, filepath, headers = {}) {
  fs.readFile(filepath, (err, data) => {
    if (err) {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      return res.end('Not found');
    }
    Object.entries(headers).forEach(([k,v]) => res.setHeader(k, v));
    res.writeHead(200);
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  // Add X-XSS-Protection header if enabled
  if (ENABLE_XXSP) {
    // legacy header: enable auditor and block on detection
    res.setHeader('X-XSS-Protection', '1; mode=block');
  }

  const url = req.url.split('?')[0];

  if (url === '/' || url === '/victim.html') {
    return sendFile(res, path.join(ROOT, 'victim.html'), {
      'Content-Type': 'text/html; charset=utf-8'
    });
  }

  // fallback
  res.writeHead(404, {'Content-Type': 'text/plain'});
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}/victim.html`);
  console.log(`X-XSS-Protection header is ${ENABLE_XXSP ? 'ENABLED (1; mode=block)' : 'DISABLED/ABSENT'}`);
});
