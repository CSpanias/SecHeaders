const express = require("express");
const path = require("path");
const csp = require("./csp-config");

const app = express();
const PORT = process.env.PORT || 3000;
const MODE = process.env.CSP_MODE || "reflected-xss";

const config = csp[MODE];

if (!config) {
  console.error(`Invalid CSP_MODE: ${MODE}`);
  process.exit(1);
}

console.log(`\n[CSP PoC] Running mode: ${MODE}`);
console.log(`[CSP PoC] Using header: ${config.header}\n`);

app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", config.header);
  next();
});

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Serve the mode-specific file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", config.file));
});

app.listen(PORT, () =>
  console.log(`[CSP PoC] Server listening on http://localhost:${PORT}`)
);
