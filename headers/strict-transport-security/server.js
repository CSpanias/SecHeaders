// server.js — minimal PoC: HTTP (80) and HTTPS (443) servers.
// Requires server.key and server.crt for TLS (see instructions).
// Run as root or with sudo to bind ports 80/443, or adapt ports.

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const HOST = process.env.HOST || 'example.test';
const HTTP_PORT = Number(process.env.HTTP_PORT || 80);
const HTTPS_PORT = Number(process.env.HTTPS_PORT || 443);
const HSTS_ENABLED = process.env.HSTS === "1"; // set HSTS=1 to enable header
const HSTS_VALUE = process.env.HSTS_VALUE || 'max-age=31536000; includeSubDomains; preload';

const certDir = path.join(__dirname, 'cert');
const keyPath = path.join(certDir, 'server.key');
const crtPath = path.join(certDir, 'server.crt');

function sendFile(res, filepath, headers = {}) {
  fs.readFile(filepath, (err, data) => {
    if (err) {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      return res.end('Not found');
    }
    Object.entries(headers).forEach(([k,v]) => res.setHeader(k, v));
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(data);
  });
}

// HTTPS server: serves victim.html and optionally sets HSTS header
if (!fs.existsSync(keyPath) || !fs.existsSync(crtPath)) {
  console.error('TLS certificate/key missing. See README to create cert/server.key and cert/server.crt');
  process.exit(1);
}

const options = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(crtPath)
};

const httpsServer = https.createServer(options, (req, res) => {
  if (HSTS_ENABLED) {
    res.setHeader('Strict-Transport-Security', HSTS_VALUE);
  }
  if (req.url === '/' || req.url === '/victim.html') {
    return sendFile(res, path.join(__dirname, 'victim.html'));
  }
  res.writeHead(302, {'Location': '/'});
  res.end();
});

httpsServer.listen(HTTPS_PORT, () => {
  console.log(`HTTPS server running: https://${HOST}:${HTTPS_PORT}/victim.html`);
  console.log(`HSTS is ${HSTS_ENABLED ? 'ENABLED -> ' + HSTS_VALUE : 'DISABLED'}`);
});

// HTTP server: simple page that shows it's HTTP and offers a link to https
const httpServer = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/victim.html') {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    return res.end(`
      <html><body>
        <h2>HTTP page on ${HOST}</h2>
        <p>This is plain HTTP. If HSTS was set previously by the HTTPS site, your browser will auto-upgrade requests to HTTPS and you may not see this page when visiting http://${HOST}/</p>
        <p><a href="https://${HOST}/">Open HTTPS version</a></p>
      </body></html>
    `);
  }
  res.writeHead(302, {'Location': '/'});
  res.end();
});

httpServer.listen(HTTP_PORT, () => {
  console.log(`HTTP server running: http://${HOST}:${HTTP_PORT}/victim.html`);
});
