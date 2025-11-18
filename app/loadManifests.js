const fs = require('fs');
const path = require('path');

module.exports = function loadManifests() {
  const baseDir = path.join(process.cwd(), 'headers');

  return fs.readdirSync(baseDir)
    .filter(folder =>
      fs.existsSync(path.join(baseDir, folder, 'manifest.json'))
    )
    .map(folder => ({
      folder,
      manifest: JSON.parse(
        fs.readFileSync(
          path.join(baseDir, folder, 'manifest.json'),
          'utf8'
        )
      )
    }));
};
