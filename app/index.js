const express = require('express');
const loadManifests = require('./loadManifests');
const mountPoC = require('./mountPoC');
const path = require('path');

const app = express();

// Serve dashboard static files
app.use('/', express.static(path.join(process.cwd(), 'webapp')));

// Load manifests
const manifests = loadManifests();

// API for the dashboard
app.get('/api/pocs', (req, res) => {
  const list = manifests.map(({ folder, manifest }) => ({
    folder,
    title: manifest.title,      // <-- added
    description: manifest.description
  }));

  res.json(list);
});

// Mount each PoC under /headers/<poc>/
manifests.forEach(({ folder, manifest }) => {
  mountPoC(app, folder, manifest);
});

const port = 3000;
app.listen(port, () => {
  console.log(`Unified Security Headers App running at http://localhost:${port}`);
  console.log(`Dashboard: http://localhost:${port}/`);
});
