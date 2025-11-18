const express = require('express');
const path = require('path');

module.exports = function routerFactory(folder, manifest) {
  const router = express.Router();

  // Apply headers if defined
  if (manifest.headers) {
    router.use((req, res, next) => {
      for (const [key, val] of Object.entries(manifest.headers)) {
        res.setHeader(key, val);
      }
      next();
    });
  }

  // Serve the PoC folder as static so files like README.md are accessible
  const pocFolderPath = path.join(process.cwd(), 'headers', folder);
  router.use(express.static(pocFolderPath));

  // Serve entry HTML
  const entryFile = manifest.entry || path.join(pocFolderPath, 'index.html');
  router.get('/', (req, res) => {
    res.sendFile(entryFile);
  });

  return router;
};
