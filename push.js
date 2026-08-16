const fs = require('fs');
const path = require('path');

const fromDatapackDir = path.join(__dirname, "datapack");
const fromResourcepackDir = path.join(__dirname, "resourcepack");

const minecraftDir = "C:\\Users\\nyali\\AppData\\Roaming\\PrismLauncher\\instances\\26.2\\minecraft";
const datapackDir = path.join(minecraftDir, "saves", "CreamSMP", "datapacks", "CreamSMP");
const resourcepackDir = path.join(minecraftDir, "resourcepacks", "CreamSMP");

// Remove existing datapack folder if it exists
if (fs.existsSync(datapackDir)) {
    fs.rmSync(datapackDir, { recursive: true, force: true });
    console.log(`Removed existing datapack folder at ${datapackDir}`);
}

// Remove existing resourcepack folder if it exists
if (fs.existsSync(resourcepackDir)) {
    fs.rmSync(resourcepackDir, { recursive: true, force: true });
    console.log(`Removed existing resourcepack folder at ${resourcepackDir}`);
}

// Copy datapack folder
createDirectoryIfNotExists(datapackDir);
fs.cpSync(fromDatapackDir, datapackDir, { recursive: true });
console.log(`Copied datapack from ${fromDatapackDir} to ${datapackDir}`);

// Copy resourcepack folder
createDirectoryIfNotExists(resourcepackDir);
fs.cpSync(fromResourcepackDir, resourcepackDir, { recursive: true });
console.log(`Copied resourcepack from ${fromResourcepackDir} to ${resourcepackDir}`);

function createDirectoryIfNotExists(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory at ${dir}`);
    }
}