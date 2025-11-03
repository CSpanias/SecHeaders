// server.js — minimal Node server that toggles headers via env
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
// Controls behavior:
// MODE=wrong        -> serve script.js as text/plain (wrong Content-Type), no nosniff
// MODE=correct      -> serve script.js as application/javascript (correct)
// MODE=wrong+nosniff-> serve text/plain AND set X-Content-Type-Options: nosniff
const MODE = process.env.MODE || 'wrong';

function sendFile(res, filepath, headers = {}) {
  fs.readFile(filepath, (err, data) => {
    if (err) {
      res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'});
      return res.end('Not found');
    }
    Object.entries(headers).forEach(([k,v]) => res.setHeader(k, v));
    res.writeHead(200);
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  if (url === '/' || url === '/victim.html') {
    return sendFile(res, path.join(__dirname, 'victim.html'), {
      'Content-Type': 'text/html; charset=utf-8'
    });
  }

  if (url === '/script.js') {
    if (MODE === 'correct') {
      return sendFile(res, path.join(__dirname, 'script.js'), {
        'Content-Type': 'application/javascript; charset=utf-8'
      });
    } else if (MODE === 'wrong+nosniff') {
      return sendFile(res, path.join(__dirname, 'script.js'), {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff'
      });
    } else { // default: wrong
      return sendFile(res, path.join(__dirname, 'script.js'), {
        'Content-Type': 'text/plain; charset=utf-8'
      });
    }
  }

  // fallback
  res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'});
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`Server listening: http://localhost:${PORT}/victim.html`);
  console.log(`MODE=${MODE}  (use MODE=wrong|correct|wrong+nosniff)`);
});

