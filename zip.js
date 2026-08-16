const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const sourceDir = path.join(__dirname, 'resourcepack');
const outputDir = path.join(__dirname, 'releases');
const outputFile = path.join(outputDir, 'CreamSMP-ResourcePack.zip');

if (!fs.existsSync(sourceDir)) {
  console.error(`Source folder not found: ${sourceDir}`);
  process.exit(1);
}

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const output = fs.createWriteStream(outputFile);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log(`Created ${outputFile} (${archive.pointer()} total bytes)`);
});

archive.on('warning', (err) => {
  if (err.code === 'ENOENT') {
    console.warn(err);
  } else {
    throw err;
  }
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);
archive.directory(sourceDir, false);
archive.finalize();
