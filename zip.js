const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const sourceDir = path.join(__dirname, 'resourcepack');
const outputDir = path.join(__dirname, 'Releases');
const outputFile = path.join(outputDir, 'CreamSMP-ResourcePack.zip');

if (!fs.existsSync(sourceDir)) {
  console.error(`Source folder not found: ${sourceDir}`);
  process.exit(1);
}

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

try {
  const archive = new AdmZip();
  archive.addLocalFolder(sourceDir);
  archive.writeZip(outputFile);

  const fileSize = fs.statSync(outputFile).size;
  console.log(`Created ${outputFile} (${fileSize} total bytes)`);
} catch (err) {
  console.error(`Failed to create archive: ${err.message}`);
  process.exit(1);
}
