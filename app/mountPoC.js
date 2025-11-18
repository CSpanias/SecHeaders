const express = require('express');
const path = require('path');
const routerFactory = require('./routerFactory');

module.exports = function mountPoC(app, folder, manifest) {
  const basePath = `/headers/${folder}/`;

  const router = routerFactory(folder, manifest);
  app.use(basePath, router);

  console.log(`Mounted PoC: ${folder} at ${basePath}`);
};
