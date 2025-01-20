const fs = require('fs');
const manifest = require('../manifest.json');

// Increment build in the version field (e.g., 1.0.0.1 → 1.0.0.2)
const parts = manifest.version.split('.');
parts[parts.length - 1] = (parseInt(parts[parts.length - 1]) + 1).toString();
manifest.version = parts.join('.');

fs.writeFileSync('manifest.json', JSON.stringify(manifest, null, 2));