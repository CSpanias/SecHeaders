// server.js — CSP PoC with guaranteed mixed-content blocking

const express = require("express");
const path = require("path");
const fs = require("fs");
const https = require("https");
const http = require("http");

const csp = require("./csp-config");

const HTTPS_PORT = 3443;
const HTTP_INSECURE_PORT = 3001; // HTTP server for mixed-content demo
const MODE = process.env.CSP_MODE || "mixed-content";

const app = express();

// ---------------------------
// CSP header
// ---------------------------
const config = csp[MODE];
if (!config) {
  console.error(`[ERROR] Invalid CSP_MODE: ${MODE}`);
  process.exit(1);
}

console.log(`\n[CSP PoC] Mode: ${MODE}`);

if (config.header) {
  console.log(`[CSP PoC] CSP Header:\n${config.header}\n`);
  app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", config.header);
    next();
  });
} else {
  console.log("[CSP PoC] CSP disabled (CSP_MODE=none)\n");
}

// ---------------------------
// Serve main PoC pages
// ---------------------------
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", config.file));
});

// ---------------------------
// HTTPS server
// ---------------------------
const keyPath = path.join(__dirname, "server.key");
const certPath = path.join(__dirname, "server.crt");

if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
  console.error("[CSP PoC] Missing SSL certificates. HTTPS server required for mixed-content demo.");
  process.exit(1);
}

const sslOptions = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
};

https.createServer(sslOptions, app).listen(HTTPS_PORT, () => {
  console.log(`[CSP PoC] HTTPS server: https://localhost:${HTTPS_PORT}`);
});

// ---------------------------
// HTTP server for insecure content (cannot be upgraded)
// ---------------------------
if (MODE === "mixed-content") {
  const insecureApp = express();

  // Prevent caching to show blocking reliably
  insecureApp.use((req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
  });

  insecureApp.use(express.static(path.join(__dirname, "images")));

  http.createServer(insecureApp).listen(HTTP_INSECURE_PORT, () => {
    console.log(`[CSP PoC] Insecure HTTP server: http://localhost:${HTTP_INSECURE_PORT}`);
  });
}

// Endpoint for the xhr-restriction PoC
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from same-origin!" });
});