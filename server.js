// server.js - SecHeaders main app (integrates referrer-policy PoC)
const express = require('express');
const path = require('path');

const app = express();
const PORT = Number(process.env.PORT || 3000);

// Map short names to header values
const REF_MAP = {
  NONE: null, // don't set header
  STRICT: 'strict-origin-when-cross-origin',
  NO_REFERRER: 'no-referrer',
  NO_REFERRER_WHEN_DOWNGRADE: 'no-referrer-when-downgrade'
};

// default mode from environment (applies when request does not pass ?mode=)
const DEFAULT_MODE = (process.env.REFERRER || 'NONE').toUpperCase();
const DEFAULT_HEADER = REF_MAP[DEFAULT_MODE] || null;

console.log(`SecHeaders starting on http://localhost:${PORT}`);
console.log(`Default Referrer-Policy mode: ${DEFAULT_MODE}${DEFAULT_HEADER ? ` -> ${DEFAULT_HEADER}` : ' (no header set)'}`);

// serve static assets (css/js if you later add)
app.use('/static', express.static(path.join(__dirname, 'public')));

// Landing page
app.get('/', (req, res) => {
  res.send(`
    <!doctype html>
    <html>
      <head><meta charset="utf-8"><title>SecHeaders - HTTP header PoCs</title></head>
      <body style="font-family:system-ui,Segoe UI,Roboto,Arial">
        <h1>SecHeaders</h1>
        <p>Collection of HTTP header explanations and PoCs. Click a header to view details and run PoCs locally.</p>
        <ul>
          <li><a href="/headers/referrer-policy">Referrer-Policy</a></li>
        </ul>
        <hr>
        <p style="font-size:0.9em;color:#666">Tip: you can set the default mode with <code>REFERRER=STRICT npm start</code> or add <code>?mode=STRICT</code> to PoC links.</p>
      </body>
    </html>
  `);
});

// Explanation page for Referrer-Policy
app.get('/headers/referrer-policy', (req, res) => {
  res.sendFile(path.join(__dirname, 'headers', 'referrer-policy', 'referrer-policy.html'));
});

// Middleware to compute header value for referrer PoC routes
function referrerHeaderMiddleware(req, res, next) {
  // per-request override via ?mode=
  const qmode = (req.query.mode || '').toUpperCase();
  const mode = qmode || DEFAULT_MODE;
  const headerValue = REF_MAP.hasOwnProperty(mode) ? REF_MAP[mode] : null;
  if (headerValue) {
    res.setHeader('Referrer-Policy', headerValue);
  }
  // attach for logging/debug
  req._referrer_mode = mode;
  req._referrer_header_value = headerValue;
  next();
}

// Mount PoC static files with middleware
app.use('/poc/referrer-policy', referrerHeaderMiddleware, express.static(path.join(__dirname, 'headers', 'referrer-policy')));

// Special logging route: leak endpoint logs Referer header
app.get('/poc/referrer-policy/leak.html', (req, res, next) => {
  // log the referer header every time leak.html is requested
  console.log(`[PoC][Referrer] mode=${req._referrer_mode} header=${req._referrer_header_value || '(none)'} Referer received: ${req.headers.referer || '(none)'}`);
  // continue to static serve the page
  next();
});

// 404 handler
app.use((req, res) => {
  res.status(404).send('Not found');
});

app.listen(PORT, () => {
  console.log(`Server ready — open http://localhost:${PORT}`);
  console.log(`PoC victim page: http://localhost:${PORT}/poc/referrer-policy/victim.html?secret=LEAKME`);
  console.log(`Explanation: http://localhost:${PORT}/headers/referrer-policy`);
});
