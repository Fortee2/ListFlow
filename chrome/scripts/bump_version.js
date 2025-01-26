const fs = require('fs');
const manifest = require('../manifest.json');

// Increment build in the version field (e.g., 1.0.0.1 → 1.0.0.2)
const parts = manifest.version.split('.');
let currentDate = new Date();
parts[0] = currentDate.getFullYear().toString();
parts[1] = (currentDate.getMonth() + 1).toString();
if (parts[2] !== currentDate.getDate().toString()) {
    parts[2] = currentDate.getDate().toString();
    parts[parts.length - 1] = '0';
}

parts[parts.length - 1] = (parseInt(parts[parts.length - 1]) + 1).toString();
manifest.version = parts.join('.');

fs.writeFileSync('manifest.json', JSON.stringify(manifest, null, 2));