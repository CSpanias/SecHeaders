module.exports = {
  "reflected-xss": {
    header: "script-src 'self';",
    file: "reflected-xss.html"
  },
  "dom-xss": {
    header: "script-src 'self';",
    file: "dom-xss.html"
  },
  "unsafe-inline": {
    header: "script-src 'self' 'unsafe-inline';",
    file: "unsafe-inline.html"
  },
  "script-nonce": {
    header: "script-src 'nonce-random123';",
    file: "script-nonce.html"
  },
  "mixed-content": {
    header: "block-all-mixed-content;",
    file: "mixed-content.html"
  },
  "clickjacking": {
    header: "frame-ancestors 'none';",
    file: "clickjacking.html"
  },
  "xhr-restriction": 
  {
    header: "connect-src 'self' https://api.example.com;",
    file: "xhr-restriction.html"
  }
};
