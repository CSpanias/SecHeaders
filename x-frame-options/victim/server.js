// server.js (manual header example)
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Add frame protection BEFORE static middleware
app.use((req, res, next) => {
  // Choose one:
  res.setHeader('X-Frame-Options', 'DENY');        // strictest: block all framing
  // res.setHeader('X-Frame-Options', 'SAMEORIGIN');   // allow only same-origin frames
  // Alternative modern CSP (not used here): 
  // res.setHeader('Content-Security-Policy', "frame-ancestors 'self'");
  next();
});

// Then serve static files (victim.html etc.)
app.use(express.static(path.join(__dirname)));

app.listen(PORT, () => {
  console.log(`Victim server running: http://localhost:${PORT}/victim.html`);
});